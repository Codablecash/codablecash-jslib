import { AbstractBlockchainTransaction } from "../bc_trx/AbstractBlockchainTransaction";
import { AbstractUtxo } from "../bc_trx/AbstractUtxo";
import { AbstractUtxoReference } from "../bc_trx/AbstractUtxoReference";
import { WalletAccount } from "../bc_wallet/WalletAccount";
import { WalletAccountTrxRepository } from "../bc_wallet_trx_repo/WalletAccountTrxRepository";

export abstract class AbstractWalletTransactionHandler {
    protected account : WalletAccount;

    constructor(account : WalletAccount) {
        this.account = account;
    }

    public abstract importTransaction(trx : AbstractBlockchainTransaction) : void;

    protected __importTransaction(__trx : AbstractBlockchainTransaction) : void {
        let trxRepo = this.account.getWalletAccountTrxRepository();

        let imported = false;
        // remove used utxos
        {
            let maxLoop = __trx.getUtxoReferenceSize();
            for(let i = 0; i != maxLoop; ++i){
                let utxoRef = __trx.getUtxoReference(i);
                let utxoId = utxoRef.getUtxoId();

                if(utxoId == null){
                    continue;
                }

                let finded = trxRepo.getUtxo(utxoId);
                if(finded != null){
                    trxRepo.removeUtxo(utxoId);
                    imported = true;
                }
            }
        }

        // add utxo
        let maxLoop = __trx.getUtxoSize();
        for(let i = 0; i != maxLoop; ++i){
            let utxo = __trx.getUtxo(i);

            let addressDesc = utxo.getAddress();

            if(!utxo.isRemote() && this.account.hasAddress(addressDesc)){
                trxRepo.importUtxo(utxo);
                imported = true;
            }
        }

        if(imported){
            trxRepo.importTransaction(__trx);
        }
    }
}