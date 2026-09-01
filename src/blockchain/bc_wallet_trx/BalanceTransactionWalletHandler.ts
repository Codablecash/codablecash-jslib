import { Secp256k1CompressedPoint } from "../../base/ecda/Secp256k1CompressedPoint";
import { Secp256k1Point } from "../../base/ecda/Secp256k1Point";
import { ArrayList } from "../../db/base/ArrayList";
import { BalanceUnit } from "../bc_base/BalanceUnit";
import { AbstractBlockchainTransaction } from "../bc_trx/AbstractBlockchainTransaction";
import { BalanceShortageException } from "../bc_trx_balance/BalanceShortageException";
import { BalanceTransferTransaction } from "../bc_trx_balance/BalanceTransferTransaction";
import { BalanceUtxo } from "../bc_trx_balance/BalanceUtxo";
import { BalanceUtxoReference } from "../bc_trx_balance/BalanceUtxoReference";
import { HdWalleMuSigSignerProvidor } from "../bc_wallet/HdWalleMuSigSignerProvidor";
import { WalletAccount } from "../bc_wallet/WalletAccount";
import { IWalletDataEncoder } from "../bc_wallet_encoder/IWalletDataEncoder";
import { ArrayUtxoFinder } from "../bc_wallet_trx_base/ArrayUtxoFinder";
import { ITransactionBuilderContext } from "../bc_wallet_trx_base/ITransactionBuilderContext";
import { IUtxoCollector } from "../bc_wallet_trx_base/IUtxoCollector";
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
            let maxLoop = dest.size();
            for(let i = 0; i != maxLoop; ++i){
                let d = dest.get(i);

                if(d != null){
                    let utxo = new BalanceUtxo(d.getAmount());
                    utxo.setAddress(d.getDest());
                    trx.addBalanceUtxo(utxo);

                    amount.addSelf(d.getAmount()) // += *d.getAmount();
                }
            }
        }

        trx.build();
        trx.sign(musigProvidor, utxoFinder);

        this.collectUtxoRefs(trx, amount, feeRate, collector, utxoFinder, musigProvidor, encoder);

        trx.build();
        trx.sign(musigProvidor, utxoFinder);

        return trx;
    }

    private collectUtxoRefs(trx : BalanceTransferTransaction, amount : BalanceUnit, feeRate : BalanceUnit
            , collector : IUtxoCollector, utxoFinder : ArrayUtxoFinder, musigProvidor : HdWalleMuSigSignerProvidor, encoder : IWalletDataEncoder) : void {
        let destUtxoSize = trx.getUtxoSize();

        let binSize = trx.binarySize();
        let fee : BalanceUnit = BalanceUnit.multiply(new BalanceUnit(binSize), feeRate);

        let required = BalanceUnit.add(fee, amount);
        let totalIn = utxoFinder.getTotalAmount();

        while(collector.hasNext() && totalIn.compareTo(required) < 0){
            let utxo = collector.next();
            let desc = utxo.getAddress();

            let ref = new BalanceUtxoReference();
            ref.setUtxoId(utxo.getId(), desc);

            let signer = musigProvidor.getSigner(desc);
            let pt = signer.getxG();
            let xi = Secp256k1CompressedPoint.compress(pt);
            ref.setXi(xi);

            trx.addInputUtxoRef(ref);

            utxoFinder.addUtxo(utxo);

            // calc addfee
            let refbinSize = ref.binarySize();
            binSize += refbinSize;

            fee = BalanceUnit.multiply(new BalanceUnit(binSize), feeRate);
            required = BalanceUnit.add(fee, amount);
            totalIn = utxoFinder.getTotalAmount();

            trx.setFeeAmount(fee);

            // add exchange address
            if(totalIn.compareTo(required) > 0){
                if(trx.getUtxoSize() == destUtxoSize){ // utxo size
                    // add
                    let changeAddresses = this.account.getChangeAddresses();
                    let changeDesc = changeAddresses.getNextChangeAddress(encoder);

                    let utxobinSize = 0;
                    {
                        let tmp = new  BalanceUnit(0);
                        let utxo = new BalanceUtxo(tmp);
                        utxo.setAddress(changeDesc);
                        trx.addBalanceUtxo(utxo);

                        utxo.build();
                        utxobinSize = utxo.binarySize();
                    }
                    binSize += utxobinSize;

                    // recalc
                    fee = BalanceUnit.multiply(new BalanceUnit(binSize), feeRate);

                    required = BalanceUnit.add(fee, amount);
                    totalIn = utxoFinder.getTotalAmount();

                    // setup
                    trx.setFeeAmount(fee);

                    let diff = BalanceUnit.minus(totalIn, required);
                    {
                        let u = trx.getUtxo(1);
                        let utxo = <BalanceUtxo>(u);
                        utxo.setAmount(diff);
                    }
                }
                else{
                    let diff = BalanceUnit.minus(totalIn, required);
                    let u = trx.getUtxo(1);
                    let utxo = <BalanceUtxo>(u);

                    utxo.setAmount(diff);
                }
            }
        }

        if(totalIn.compareTo(required) < 0){
            throw new BalanceShortageException("Wallet don't have enough balance.");
        }
        //ExceptionThrower<BalanceShortageException>::throwExceptionIfCondition(totalIn.compareTo(&required) < 0, L"Wallet don't have enough balance.", __FILE__, __LINE__);
    }

    public createFeeIncludedTransaction(dest : ArrayList<DestAddressPair>, feeRate : BalanceUnit,
            encoder : IWalletDataEncoder, context : ITransactionBuilderContext) : BalanceTransferTransaction {
        let collector = context.getUtxoCollector();
        let utxoFinder = new ArrayUtxoFinder();

        let musigProvidor = context.getMusigSignProvidor(encoder);

        let trx = new BalanceTransferTransaction();
        // add output utxo
        let amount = new BalanceUnit(0);
        {
            let maxLoop = dest.size();
            for(let i = 0; i != maxLoop; ++i){
                let d = dest.get(i);

                if(d != null){ // guard
                    let utxo = new BalanceUtxo(d.getAmount());
                    utxo.setAddress(d.getDest());
                    trx.addBalanceUtxo(utxo);

                    amount.addSelf(d.getAmount());
                }
            }
        }

        let totalIn = utxoFinder.getTotalAmount();
        while(collector.hasNext() && totalIn.compareTo(amount) < 0){
            let utxo = collector.next();
            let desc = utxo.getAddress();

            let ref = new BalanceUtxoReference();
            ref.setUtxoId(utxo.getId(), desc);

            let signer = musigProvidor.getSigner(desc);
            let pt = signer.getxG();
            let xi = Secp256k1CompressedPoint.compress(pt);
            ref.setXi(xi);

            trx.addInputUtxoRef(ref);

            utxoFinder.addUtxo(utxo);

            totalIn = utxoFinder.getTotalAmount();
        }
        // ExceptionThrower<BalanceShortageException>::throwExceptionIfCondition(totalIn.compareTo(amount) < 0, L"Wallet don't have enough balance.", __FILE__, __LINE__);
        if(totalIn.compareTo(amount) < 0){
            throw new BalanceShortageException("Wallet don't have enough balance.");
        }


        // set exchange
        if(totalIn.compareTo(amount) > 0){
            let changeAddresses = this.account.getChangeAddresses();
            let changeDesc = changeAddresses.getNextChangeAddress(encoder);

            let diff = BalanceUnit.minus(totalIn, amount);
            let utxo = new BalanceUtxo(diff);
            utxo.setAddress(changeDesc);
            trx.addBalanceUtxo(utxo);
        }

        // calc fee
        {
            trx.build();
            trx.sign(musigProvidor, utxoFinder);

            let binSize = trx.binarySize();
            let fee = BalanceUnit.multiply(new BalanceUnit(binSize), feeRate);

            trx.setFeeAmount(fee);

            let u = trx.getUtxo(0);

            let utxo = <BalanceUtxo>(u);
            utxo.discountFee(fee);
        };

        trx.build();
        trx.sign(musigProvidor, utxoFinder);

        return trx;
    }

    public importTransaction(__trx : AbstractBlockchainTransaction) {
        let trx = <BalanceTransferTransaction>(__trx);
        let trxRepo = this.account.getWalletAccountTrxRepository();

        let imported = false;

        // remove used utxos
        {
            const list = trx.getUtxoRefList();
            const maxLoop = list.size();
            for(let i = 0; i != maxLoop; ++i){
                let utxoRef = list.get(i);

                if(utxoRef != null){
                    let utxoId = utxoRef.getUtxoId();

                    let finded = trxRepo.getBalanceUtxo(utxoId);
                    if(finded != null){
                        trxRepo.removeUtxo(utxoId);
                        imported = true;
                    }
                }
            }
        }

        // add utxo
        let maxLoop = trx.getUtxoSize();
        for(let i = 0; i != maxLoop; ++i){
            let utxo = trx.getUtxo(i);

            let addressDesc = utxo.getAddress();
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