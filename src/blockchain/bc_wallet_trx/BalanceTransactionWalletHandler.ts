import { ArrayList } from "../../db/base/ArrayList";
import { BalanceUnit } from "../bc_base/BalanceUnit";
import { BalanceTransferTransaction } from "../bc_trx_balance/BalanceTransferTransaction";
import { HdWalleMuSigSignerProvidor } from "../bc_wallet/HdWalleMuSigSignerProvidor";
import { WalletAccount } from "../bc_wallet/WalletAccount";
import { IWalletDataEncoder } from "../bc_wallet_encoder/IWalletDataEncoder";
import { ITransactionBuilderContext } from "../bc_wallet_trx_base/ITransactionBuilderContext";
import { AbstractWalletTransactionHandler } from "./AbstractWalletTransactionHandler";
import { DestAddressPair } from "./DestAddressPair";

export class BalanceTransactionWalletHandler extends AbstractWalletTransactionHandler {

    constructor(account : WalletAccount){
        super(account);
    }

public createTransaction(dest : ArrayList<DestAddressPair>, feeRate : BalanceUnit,
		feeIncluded : boolean, encoder : IWalletDataEncoder, context : ITransactionBuilderContext) : BalanceTransferTransaction {
	if(feeIncluded){
		return this.createFeeIncludedTransaction(dest, feeRate, encoder, context);
	}

	let collector = context.getUtxoCollector();
	let utxoFinder = new ArrayUtxoFinder();

	let musigProvidor = context.getMusigSignProvidor(encoder);

	let trx = new BalanceTransferTransaction();
	// add output utxo
	let amount = new BalanceUnit(0);
	{
		int maxLoop = dest.size();
		for(int i = 0; i != maxLoop; ++i){
			DestAddressPair* d = dest.get(i);

			BalanceUtxo utxo(*d.getAmount());
			utxo.setAddress(d.getDest());
			trx.addBalanceUtxo(&utxo);

			amount += *d.getAmount();
		}
	}

	trx.build();
	trx.sign(musigProvidor, &utxoFinder);

	collectUtxoRefs(trx, amount, feeRate, collector, &utxoFinder, musigProvidor, encoder);

	trx.build();
	trx.sign(musigProvidor, &utxoFinder);

	return __STP_MV(trx);
}

void BalanceTransactionWalletHandler::collectUtxoRefs(BalanceTransferTransaction* trx, BalanceUnit& amount, const BalanceUnit& feeRate
		, IUtxoCollector *collector, ArrayUtxoFinder *utxoFinder, HdWalleMuSigSignerProvidor *musigProvidor, const IWalletDataEncoder* encoder) {
	int destUtxoSize = trx.getUtxoSize();

	int binSize = trx.binarySize();
	BalanceUnit fee = BalanceUnit(binSize) * feeRate;

	BalanceUnit required = fee + amount;
	BalanceUnit totalIn = utxoFinder.getTotalAmount();

	while(collector.hasNext() && totalIn.compareTo(&required) < 0){
		BalanceUtxo* utxo = collector.next(); __STP(utxo);
		const AddressDescriptor* desc = utxo.getAddress();

		BalanceUtxoReference ref;
		ref.setUtxoId(utxo.getId(), desc);

		IMuSigSigner* signer = musigProvidor.getSigner(desc); __STP(signer);
		Secp256k1Point pt = signer.getxG();
		Secp256k1CompressedPoint xi = Secp256k1CompressedPoint::compress(&pt);
		ref.setXi(&xi);

		trx.addInputUtxoRef(&ref);

		utxoFinder.addUtxo(utxo);

		// calc addfee
		int refbinSize = ref.binarySize();
		binSize += refbinSize;

		fee = BalanceUnit(binSize) * feeRate;
		required = fee + amount;
		totalIn = utxoFinder.getTotalAmount();

		trx.setFeeAmount(&fee);

		// add exchange address
		if(totalIn.compareTo(&required) > 0){
			if(trx.getUtxoSize() == destUtxoSize){ // utxo size
				// add
				ChangeAddressStore* changeAddresses = this.account.getChangeAddresses();
				AddressDescriptor* changeDesc = changeAddresses.getNextChangeAddress(encoder); __STP(changeDesc);

				int utxobinSize = 0;
				{
					BalanceUnit tmp(0L);
					BalanceUtxo utxo(tmp);
					utxo.setAddress(changeDesc);
					trx.addBalanceUtxo(&utxo);

					utxo.build();
					utxobinSize = utxo.binarySize();
				}
				binSize += utxobinSize;

				// recalc
				fee = BalanceUnit(binSize) * feeRate;

				required = fee + amount;
				totalIn = utxoFinder.getTotalAmount();

				// setup
				trx.setFeeAmount(&fee);

				BalanceUnit diff = totalIn - required;
				{
					AbstractUtxo* u = trx.getUtxo(1);
					BalanceUtxo* utxo = dynamic_cast<BalanceUtxo*>(u);
					utxo.setAmount(diff);
				}
			}
			else{
				BalanceUnit diff = totalIn - required;
				AbstractUtxo* u = trx.getUtxo(1);
				BalanceUtxo* utxo = dynamic_cast<BalanceUtxo*>(u);

				utxo.setAmount(diff);
			}
		}
	}

	ExceptionThrower<BalanceShortageException>::throwExceptionIfCondition(totalIn.compareTo(&required) < 0, L"Wallet don't have enough balance.", __FILE__, __LINE__);
}

BalanceTransferTransaction* BalanceTransactionWalletHandler::createFeeIncludedTransaction(ArrayList<DestAddressPair>* dest, const BalanceUnit& feeRate,
		const IWalletDataEncoder *encoder, ITransactionBuilderContext *context) {
	IUtxoCollector* collector = context.getUtxoCollector(); __STP(collector);
	ArrayUtxoFinder utxoFinder;

	HdWalleMuSigSignerProvidor* musigProvidor = context.getMusigSignProvidor(encoder); __STP(musigProvidor);

	BalanceTransferTransaction* trx = new BalanceTransferTransaction(); __STP(trx);
	// add output utxo
	BalanceUnit amount(0L);
	{
		int maxLoop = dest.size();
		for(int i = 0; i != maxLoop; ++i){
			DestAddressPair* d = dest.get(i);

			BalanceUtxo utxo(*d.getAmount());
			utxo.setAddress(d.getDest());
			trx.addBalanceUtxo(&utxo);

			amount += *d.getAmount();
		}
	}

	BalanceUnit totalIn = utxoFinder.getTotalAmount();
	while(collector.hasNext() && totalIn.compareTo(&amount) < 0){
		BalanceUtxo* utxo = collector.next(); __STP(utxo);
		const AddressDescriptor* desc = utxo.getAddress();

		BalanceUtxoReference ref;
		ref.setUtxoId(utxo.getId(), desc);

		IMuSigSigner* signer = musigProvidor.getSigner(desc); __STP(signer);
		Secp256k1Point pt = signer.getxG();
		Secp256k1CompressedPoint xi = Secp256k1CompressedPoint::compress(&pt);
		ref.setXi(&xi);

		trx.addInputUtxoRef(&ref);

		utxoFinder.addUtxo(utxo);

		totalIn = utxoFinder.getTotalAmount();
	}
	ExceptionThrower<BalanceShortageException>::throwExceptionIfCondition(totalIn.compareTo(&amount) < 0, L"Wallet don't have enough balance.", __FILE__, __LINE__);

	// set exchange
	if(totalIn.compareTo(&amount) > 0){
		ChangeAddressStore* changeAddresses = this.account.getChangeAddresses();
		AddressDescriptor* changeDesc = changeAddresses.getNextChangeAddress(encoder); __STP(changeDesc);

		BalanceUnit diff = totalIn - amount;
		BalanceUtxo utxo(diff);
		utxo.setAddress(changeDesc);
		trx.addBalanceUtxo(&utxo);
	}

	// calc fee
	{
		trx.build();
		trx.sign(musigProvidor, &utxoFinder);

		int binSize = trx.binarySize();
		BalanceUnit fee = BalanceUnit(binSize) * feeRate;

		trx.setFeeAmount(&fee);

		AbstractUtxo* u = trx.getUtxo(0);

		BalanceUtxo* utxo = dynamic_cast<BalanceUtxo*>(u);
		utxo.discountFee(fee);
	};

	trx.build();
	trx.sign(musigProvidor, &utxoFinder);

	return __STP_MV(trx);
}



void BalanceTransactionWalletHandler::importTransaction(const AbstractBlockchainTransaction *__trx) {
	const BalanceTransferTransaction* trx = dynamic_cast<const BalanceTransferTransaction*>(__trx);
	WalletAccountTrxRepository* trxRepo = this.account.getWalletAccountTrxRepository();

	bool imported = false;

	// remove used utxos
	{
		const ArrayList<BalanceUtxoReference>* list = trx.getUtxoRefList();
		int maxLoop = list.size();
		for(int i = 0; i != maxLoop; ++i){
			BalanceUtxoReference* utxoRef = list.get(i);
			const UtxoId* utxoId = utxoRef.getUtxoId();

			BalanceUtxo* finded = trxRepo.getBalanceUtxo(utxoId); __STP(finded);
			if(finded != nullptr){
				trxRepo.removeUtxo(utxoId);
				imported = true;
			}
		}
	}

	// add utxo
	int maxLoop = trx.getUtxoSize();
	for(int i = 0; i != maxLoop; ++i){
		AbstractUtxo* utxo = trx.getUtxo(i);

		const AddressDescriptor* addressDesc = utxo.getAddress();
		if(this.account.hasAddress(addressDesc)){
			trxRepo.importUtxo(utxo);
			imported = true;
		}
	}

	if(imported){
		trxRepo.importTransaction(trx);
	}
}
    // TODO
}