import { AddressDescriptor } from "../bc_base/AddressDescriptor";
import { BalanceUnit } from "../bc_base/BalanceUnit";
import { AbstractBlockchainTransaction } from "../bc_trx/AbstractBlockchainTransaction";
import { BalanceUtxo } from "../bc_trx_balance/BalanceUtxo";
import { GenesisTransaction } from "../bc_trx_genesis/GenesisTransaction";
import { WalletAccount } from "../bc_wallet/WalletAccount";
import { WalletAccountTrxRepository } from "../bc_wallet_trx_repo/WalletAccountTrxRepository";
import { AbstractWalletTransactionHandler } from "./AbstractWalletTransactionHandler";

export class GenesisTransactionHandler extends AbstractWalletTransactionHandler {

    constructor(account : WalletAccount){
        super(account);
    }

    public createTransaction(amount : BalanceUnit, pos : number) : GenesisTransaction {
        let addressDesc = this.account.getReceivingAddressDescriptor(pos);
        let trx = new GenesisTransaction();

        let utxo = new BalanceUtxo(amount);
        utxo.setAddress(addressDesc);

        trx.addBalanceUtxo(utxo);
        trx.build();

        return trx;
    }

    public importTransaction(__trx : AbstractBlockchainTransaction) : void {
        let trx = <GenesisTransaction>(__trx);
        let trxRepo = this.account.getWalletAccountTrxRepository();

        let imported = false;

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