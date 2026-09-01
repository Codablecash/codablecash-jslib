import { ArrayList } from "../../db/base/ArrayList";
import { AbstractUtxo } from "../bc_trx/AbstractUtxo";
import { TransactionId } from "../bc_trx/TransactionId";
import { UtxoId } from "../bc_trx/UtxoId";
import { ManagedUtxoCacheRecord } from "./ManagedUtxoCacheRecord";

export class ManagedUtxoCache {
	private list : ArrayList<ManagedUtxoCacheRecord>;
	private map : Map<string, ManagedUtxoCacheRecord>;

    constructor() {
        this.list = new ArrayList<ManagedUtxoCacheRecord>();
        this.map = new Map<string, ManagedUtxoCacheRecord>();
    }

	public getUtxoList() : ArrayList<ManagedUtxoCacheRecord> {
		return this.list;
	}

    public reset() : void {
        this.map.clear();
        this.list.reset();
    }


    /**
     *
     * @param utxo
     * @param trxId
     * @param storeType ManagedUtxoCacheRecord::FINALIZED, UNFINALIZED, MEMPOOL
     */
    public addUtxo(utxo : AbstractUtxo, trxId : TransactionId, storeType : number) {
        let record = new ManagedUtxoCacheRecord();
        record.setUtxo(utxo);
        record.setType(storeType);
        record.setTransactionId(trxId);

        this.list.addElement(record);

        let utxoId = record.getUtxoId();
        this.map.set(utxoId.toString(), record);
    }

    public getManagedUtxoCacheRecord(utxoId : UtxoId) : ManagedUtxoCacheRecord | null {
        let record = this.map.get(utxoId.toString());
        
        return record != undefined ? record : null;;
    }

    public removeUtxo(utxoId : UtxoId) : boolean {
        let result = false;

        let record = this.map.get(utxoId.toString());

        if(record != null){
            this.map.delete(utxoId.toString());

            let index = this.list.indexOfPtr(record);
            this.list.remove(index);

            result = true;
        }

        return result;
    }

    public hasUtxo(utxoId : UtxoId) : boolean {
        return this.getManagedUtxoCacheRecord(utxoId) != null;
    }

    public importOtherManagedUtxoCache(other : ManagedUtxoCache) : void {
        let maxLoop = other.list.size();
        for(let i = 0; i != maxLoop; ++i){
            let record = other.list.get(i);

            if(record != null){ // guard
                let utxo = record.getUtxo();
                let storeType = record.getType();
                let trxId = record.getTransactionId();

                this.addUtxo(utxo, trxId, storeType);
            }
        }
    }
}