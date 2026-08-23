import { NullPointerException } from "../../db/base/NullPointerException";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";
import { AbstractUtxo } from "../bc_trx/AbstractUtxo";
import { BalanceUtxo } from "../bc_trx_balance/BalanceUtxo";

export class RemoteBalanceUtxo extends BalanceUtxo {

    public getType() : number {
        return AbstractUtxo.TRX_UTXO_REMOTE_BALANCE;
    }

    public isRemote() : boolean {
        return true;
    }

    public copyData() : IBlockObject {
        if(this.addressDesc != null){
            let inst = new RemoteBalanceUtxo(this.amount);
            inst.setAddress(this.addressDesc);
            return inst;
        }
        throw new NullPointerException("RemoteBalanceUtxo.copyData()");
    }
}