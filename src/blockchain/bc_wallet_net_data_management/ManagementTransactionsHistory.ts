import { ArrayList } from "../../db/base/ArrayList";
import { NullPointerException } from "../../db/base/NullPointerException";
import { AbstractBlockchainTransaction } from "../bc_trx/AbstractBlockchainTransaction";
import { TransactionId } from "../bc_trx/TransactionId";

export class ManagementTransactionsHistory {
	private list : ArrayList<AbstractBlockchainTransaction>;
	private map : Map<string, AbstractBlockchainTransaction>;

    constructor() {
        this.list = new ArrayList<AbstractBlockchainTransaction>();
        this.map = new Map<string, AbstractBlockchainTransaction>();        
    }

    public reset() : void {
        this.map.clear();
        this.list.reset();
    }

    public addTransaction(trx : AbstractBlockchainTransaction) : void {
        let newTrx = <AbstractBlockchainTransaction>(trx.copyData());
        this.list.addElement(newTrx);

        let trxId = trx.getTransactionId();
        this.map.set(trxId.toString(), newTrx);
    }

    public historySize() : number {
        return this.list.size();
    }

    public getTransaction(i : number | TransactionId) : AbstractBlockchainTransaction {
        if(i instanceof TransactionId){
            return this.__getTransaction(i);
        }

        let n = this.list.get(i);
        if(n != null){
            return n;
        }
        throw new NullPointerException("ManagementTransactionsHistory.getTransaction()");
    }

    public __getTransaction(trxId : TransactionId)  : AbstractBlockchainTransaction {
        let trx = this.map.get(trxId.toString());

        if(trx != undefined){
            return trx;
        }
        throw new NullPointerException("ManagementTransactionsHistory.getTransaction()");
    }

    public importOtherManagementTransactionsHistory(other : ManagementTransactionsHistory) : void {
        let maxLoop = other.historySize();
        for(let i = 0; i != maxLoop; ++i){
            let trx = other.getTransaction(i);

            this.addTransaction(trx);
        }
    }


    public hasTransaction(trxId : TransactionId) : boolean {
        let trx = this.getTransaction(trxId);

        return trx != null;
    }
}