import { ArrayList } from "../../db/base/ArrayList";
import { NullPointerException } from "../../db/base/NullPointerException";
import { AbstractUtxo } from "../bc_trx/AbstractUtxo";
import { BalanceUtxo } from "../bc_trx_balance/BalanceUtxo";
import { ManagementAccount } from "../bc_wallet_net_data_management/ManagementAccount";
import { ManagementAccountsCollection } from "../bc_wallet_net_data_management/ManagementAccountsCollection";
import { IUtxoCollector } from "./IUtxoCollector";
import { NetWalletAccountUtxoArray } from "./NetWalletAccountUtxoArray";

export class NetWalletAccountUtxoCollector implements IUtxoCollector {
	private managementAccount : ManagementAccount;
	private list : ArrayList<NetWalletAccountUtxoArray>;
	private nextUtxo : BalanceUtxo | null;

	private utxoArrayIndex : number;

    constructor(managementAccount : ManagementAccount){
        this.managementAccount = managementAccount;
        this.list = new ArrayList<NetWalletAccountUtxoArray>();

        let maxLoop = 3;
        for(let i = 0; i != maxLoop; ++i){
            let ar = new NetWalletAccountUtxoArray();
            this.list.addElement(ar);
        }

        this.nextUtxo = null;

        this.utxoArrayIndex = 0;
    }

    public init() : void {
        let utxolist = this.managementAccount.getUtxoList();

        let maxLoop = utxolist.size();
        for(let i = 0; i != maxLoop; ++i){
            let record = utxolist.get(i);

            if(record != null){ // guard
                let utxo = record.getUtxo();
                let index = ManagementAccountsCollection.RECORD_SOTRE_TYPE_TO_INXED(record.getType()); // not record type

                if(utxo.getType() == AbstractUtxo.TRX_UTXO_BALANCE){
                    let ar = this.list.get(index);
                    ar?.addBalanceUtxo(<BalanceUtxo>(utxo));
                }
            }
        }
    }

    public hasNext() : boolean {
        let ret = false;
        this.nextUtxo = null;

        while(this.utxoArrayIndex < 3){
            let ar = this.list.get(this.utxoArrayIndex);

            if(ar != null && ar.hasNext()){
                let utxo = ar.next();

                this.nextUtxo = <BalanceUtxo>utxo.copyData();
                ret = true;
                break;
            }

            this.utxoArrayIndex++;
        }

        return ret;
    }

    public next() : BalanceUtxo {
        if(this.nextUtxo != null){
            return <BalanceUtxo>(this.nextUtxo.copyData());
        }
        throw new NullPointerException("NetWalletAccountUtxoCollector.next()");
    }
}