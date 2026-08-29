import { ArrayList } from "../../db/base/ArrayList";
import { AbstractBlockchainTransaction } from "../bc_trx/AbstractBlockchainTransaction";
import { AbstractUtxoReference } from "../bc_trx/AbstractUtxoReference";
import { IAddressChecker } from "../bc_trx/IAddressChecker";
import { IUtxoRefChecker } from "../bc_trx/IUtxoRefChecker";
import { TransactionId } from "../bc_trx/TransactionId";
import { ManagedUtxoCache } from "./ManagedUtxoCache";
import { ManagedUtxoCacheRecord } from "./ManagedUtxoCacheRecord";
import { ManagementTransactionsHistory } from "./ManagementTransactionsHistory";


export class ManagementAccount implements IUtxoRefChecker {
	private trxHistory : ManagementTransactionsHistory;
	private utxoCache : ManagedUtxoCache;

	private storeType : number; // FINALIZED, UNFINALIZED, or MEMPOOL

    constructor(storeType : number){
        this.storeType = storeType;

        this.trxHistory = new ManagementTransactionsHistory();
        this.utxoCache = new ManagedUtxoCache();
    }

    public reset() : void {
        this.trxHistory.reset();
        this.utxoCache.reset();
    }

    public checkUtxo(ref : AbstractUtxoReference) : boolean {
        let utxoId = ref.getUtxoId();

        return this.utxoCache.hasUtxo(utxoId);
    }

    public addTransaction(trx : AbstractBlockchainTransaction, addressChecker : IAddressChecker) {
        let trxIsRelevant = false;
        let trxId = trx.getTransactionId();

        let bl = this.trxHistory.hasTransaction(trxId);
        if(!bl){
            // utxo ref
            {
                let maxLoop = trx.getUtxoReferenceSize();
                for(let i = 0; i != maxLoop; ++i){
                    let ref = trx.getUtxoReference(i);
                    let utxoId = ref.getUtxoId();

                    let hasUtxo = this.utxoCache.removeUtxo(utxoId);
                    if(hasUtxo){
                        trxIsRelevant = true;
                    }
                }
            }

            // new utxo
            {
                let maxLoop = trx.getUtxoSize();
                for(let i = 0; i != maxLoop; ++i){
                    let utxo = trx.getUtxo(i);

                    // check if the utxo is included in the wallet
                    let desc = utxo.getAddress();

                    if(desc != null && addressChecker.checkAddress(desc)){
                        this.utxoCache.addUtxo(utxo, trxId, this.storeType);
                        trxIsRelevant = true;
                    }
                }
            }

            if(trxIsRelevant){
                this.trxHistory.addTransaction(trx);
            }
        }
    }

    public importOtherAccount(other : ManagementAccount) : void {
        this.trxHistory.importOtherManagementTransactionsHistory(other.trxHistory);
        this.utxoCache.importOtherManagedUtxoCache(other.utxoCache);
    }

    public getUtxoList() : ArrayList<ManagedUtxoCacheRecord> {
        return this.utxoCache.getUtxoList();
    }

    public hasTransaction(trxId : TransactionId) : boolean {
        let trx = this.trxHistory.getTransaction(trxId);

        return trx != null;
    }
}