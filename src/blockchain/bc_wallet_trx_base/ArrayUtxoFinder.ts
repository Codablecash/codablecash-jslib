import { ArrayList } from "../../db/base/ArrayList";
import { NullPointerException } from "../../db/base/NullPointerException";
import { BalanceUnit } from "../bc_base/BalanceUnit";
import { UtxoId } from "../bc_trx/UtxoId";
import { BalanceUtxo } from "../bc_trx_balance/BalanceUtxo";
import { IUtxoFinder } from "../bc_trx_balance/IUtxoFinder";

export class ArrayUtxoFinder implements IUtxoFinder {
    private utxoList : ArrayList<BalanceUtxo>;

    constructor(){
        this.utxoList = new ArrayList<BalanceUtxo>();
    }

    public addUtxo(utxo : BalanceUtxo) : void {
        this.utxoList.addElement(<BalanceUtxo>(utxo.copyData()));
    }

    public getBalanceUtxo(utxoId : UtxoId) : BalanceUtxo {
        let ret : BalanceUtxo | null = null;

        let maxLoop = this.utxoList.size();
        for(let i = 0; i != maxLoop; ++i){
            let utxo = this.utxoList.get(i);

            if(utxo != null && utxo.getId().equals(utxoId)){
                ret = <BalanceUtxo>(utxo.copyData());
                break;
            }
        }

        if(ret != null){
            return ret;
        }
        throw new NullPointerException("ArrayUtxoFinder.getBalanceUtxo()");
    }

    public getTotalAmount() : BalanceUnit {
        let total = new BalanceUnit(0);

        let maxLoop = this.utxoList.size();
        for(let i = 0; i != maxLoop; ++i){
            let utxo = this.utxoList.get(i);

            if(utxo != null){
                let amount = utxo.getAmount();
                total.addSelf(amount);
            }
        }

        return total;
    }
}