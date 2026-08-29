import { NullPointerException } from "../../db/base/NullPointerException";
import { AbstractUtxo } from "../bc_trx/AbstractUtxo";
import { TransactionId } from "../bc_trx/TransactionId";
import { UtxoId } from "../bc_trx/UtxoId";


export class ManagedUtxoCacheRecord {
	public static readonly NONE = 0;
	public static readonly FINALIZED = 1;
	public static readonly UNFINALIZED = 2;
	public static readonly MEMPOOL = 3;

	private utxo : AbstractUtxo | null;
	private type : number;
	private transactionId : TransactionId | null;

    constructor(){
        this.utxo = null;
        this.type = ManagedUtxoCacheRecord.FINALIZED;
        this.transactionId = null;        
    }

	public getUtxo() : AbstractUtxo {
        if(this.utxo != null){
            return this.utxo;
        }
		throw new NullPointerException("ManagedUtxoCacheRecord.getUtxo()");
	}
	public getType() : number {
		return this.type;
	}
	public getTransactionId() : TransactionId {
        if(this.transactionId != null){
            return this.transactionId;
        }
		throw new NullPointerException("ManagedUtxoCacheRecord.getTransactionId()");
	}
    public getUtxoId() : UtxoId {
        if(this.utxo != null){
            return this.utxo.getId();
        }
        throw new NullPointerException("ManagedUtxoCacheRecord.getUtxoId()");
    }

    public setUtxo(utxo : AbstractUtxo) : void {
        this.utxo = <AbstractUtxo>(utxo.copyData());
    }

    public setType(type : number) : void {
        this.type = type;
    }

    public setTransactionId(trxId : TransactionId) : void {
        this.transactionId = <TransactionId>(trxId.copyData());
    }
}