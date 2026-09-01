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

    public getTransaction(i : number | TransactionId) : AbstractBlockchainTransaction | null{
        if(i instanceof TransactionId){
            return this.__getTransaction(i);
        }

        return this.list.get(i);
    }

    public __getTransaction(trxId : TransactionId)  : AbstractBlockchainTransaction | null {
        let trx = this.map.get(trxId.toString());

        return trx != undefined ? trx : null;
    }

    public importOtherManagementTransactionsHistory(other : ManagementTransactionsHistory) : void {
        let maxLoop = other.historySize();
        for(let i = 0; i != maxLoop; ++i){
            let trx = other.getTransaction(i);

            if(trx != null){ // guard
                this.addTransaction(trx);
            }
        }
    }


    public hasTransaction(trxId : TransactionId) : boolean {
        let trx = this.getTransaction(trxId);

        return trx != null;
    }
}