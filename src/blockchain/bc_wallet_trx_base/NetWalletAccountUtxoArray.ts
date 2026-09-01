import { ArrayList } from "../../db/base/ArrayList";
import { IComparable } from "../../db/base/IComparable";
import { NullPointerException } from "../../db/base/NullPointerException";
import { BalanceUtxo } from "../bc_trx_balance/BalanceUtxo";


export class NetWalletAccountUtxoArray implements IComparable {
	private list : ArrayList<BalanceUtxo>;
	private pos : number;

    constructor(){
        this.list = new ArrayList<BalanceUtxo>();
        this.pos = 0;
    }
    
    compareTo(other: IComparable | null): number {
        throw new Error("Method not implemented.");
    }

    public addBalanceUtxo(utxo : BalanceUtxo) : void {
        this.list.addElement(<BalanceUtxo>(utxo.copyData()));
    }

    public hasNext() : boolean {
        return this.list.size() > this.pos;
    }

    public next() : BalanceUtxo {
        let ret = this.list.get(this.pos++);
        if(ret != null){
            return ret;
        }
        throw new NullPointerException("NetWalletAccountUtxoArray.next()");
    }
}