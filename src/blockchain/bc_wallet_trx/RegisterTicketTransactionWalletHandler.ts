import { Secp256k1CompressedPoint } from "../../base/ecda/Secp256k1CompressedPoint";
import { AddressDescriptor } from "../bc_base/AddressDescriptor";
import { BalanceUnit } from "../bc_base/BalanceUnit";
import { RegisterTicketTransaction } from "../bc_finalizer_trx/RegisterTicketTransaction";
import { NodeIdentifier } from "../bc_network/NodeIdentifier";
import { AbstractBlockchainTransaction } from "../bc_trx/AbstractBlockchainTransaction";
import { BalanceShortageException } from "../bc_trx_balance/BalanceShortageException";
import { BalanceUtxo } from "../bc_trx_balance/BalanceUtxo";
import { BalanceUtxoReference } from "../bc_trx_balance/BalanceUtxoReference";
import { HdWalleMuSigSignerProvidor } from "../bc_wallet/HdWalleMuSigSignerProvidor";
import { WalletAccount } from "../bc_wallet/WalletAccount";
import { IWalletDataEncoder } from "../bc_wallet_encoder/IWalletDataEncoder";
import { ArrayUtxoFinder } from "../bc_wallet_trx_base/ArrayUtxoFinder";
import { ITransactionBuilderContext } from "../bc_wallet_trx_base/ITransactionBuilderContext";
import { IUtxoCollector } from "../bc_wallet_trx_base/IUtxoCollector";
import { WalletAccountTrxRepository } from "../bc_wallet_trx_repo/WalletAccountTrxRepository";
import { AbstractWalletTransactionHandler } from "./AbstractWalletTransactionHandler";


export class RegisterTicketTransactionWalletHandler extends AbstractWalletTransactionHandler {

    constructor(account : WalletAccount){
        super(account);
    }

    public createTransaction(nodeId : NodeIdentifier, stakeAmount : BalanceUnit, feeRate : BalanceUnit, 
        ticketReturnaddressDesc : AddressDescriptor, encoder : IWalletDataEncoder, context : ITransactionBuilderContext) : RegisterTicketTransaction {
        let collector = context.getUtxoCollector();
        let utxoFinder = new ArrayUtxoFinder();

        let musigProvidor = context.getMusigSignProvidor(encoder);

        let trx = new RegisterTicketTransaction();
        trx.setNodeId(nodeId);
        trx.setAddressDescriptor(ticketReturnaddressDesc);
        trx.setAmounst(stakeAmount);

        trx.build();
        trx.sign(musigProvidor, utxoFinder);

        {
            let amount = new BalanceUnit(stakeAmount.getAmount());
            this.collectUtxoRefs(trx, amount, feeRate, collector, utxoFinder, musigProvidor, encoder);
        }

        trx.build();
        trx.sign(musigProvidor, utxoFinder);

        return trx;
    }

    public collectUtxoRefs(trx : RegisterTicketTransaction, amount : BalanceUnit, feeRate : BalanceUnit, collector : IUtxoCollector,
        utxoFinder : ArrayUtxoFinder, musigProvidor : HdWalleMuSigSignerProvidor, encoder : IWalletDataEncoder) : void {
        let binSize = trx.binarySize();
        let fee = BalanceUnit.multiply(new BalanceUnit(binSize), feeRate);

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
                if(trx.getUtxoSize() == 1){
                    // add
                    let changeAddresses = this.account.getChangeAddresses();
                    let changeDesc = changeAddresses.getNextChangeAddress(encoder);

                    let utxobinSize = 0;
                    {
                        let tmp = new BalanceUnit(0);
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
                        let u = trx.getUtxo(0);
                        let utxo = <BalanceUtxo>(u);
                        utxo.setAmount(diff);
                    }
                }
                else {
                    let diff = BalanceUnit.minus(totalIn, required);
                    let u = trx.getUtxo(0);
                    let utxo = <BalanceUtxo>(u);

                    utxo.setAmount(diff);
                }
            }
        }

        //ExceptionThrower<BalanceShortageException>::throwExceptionIfCondition(totalIn.compareTo(&required) < 0, L"Wallet don't have enough balance.", __FILE__, __LINE__);
        if(totalIn.compareTo(required) < 0){
            throw new BalanceShortageException("Wallet don't have enough balance.");
        }
    }


    public importTransaction(__trx : AbstractBlockchainTransaction) : void {
        let trx = <RegisterTicketTransaction>(__trx);
        let trxRepo = this.account.getWalletAccountTrxRepository();

        let imported = false;

        // remove used utxos
        {
            let maxLoop = trx.getUtxoReferenceSize();
            for(let i = 0; i != maxLoop; ++i){
                let utxoRef = trx.getUtxoReference(i);
                let utxoId = utxoRef.getUtxoId();

                let finded = trxRepo.getBalanceUtxo(utxoId);
                if(finded != null){
                    trxRepo.removeUtxo(utxoId);
                    imported = true;
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

}