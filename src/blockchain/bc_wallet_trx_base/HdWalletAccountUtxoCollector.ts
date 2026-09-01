import { ArrayList } from "../../db/base/ArrayList";
import { NullPointerException } from "../../db/base/NullPointerException";
import { BalanceUtxo } from "../bc_trx_balance/BalanceUtxo";
import { ChangeAddressStore } from "../bc_wallet/ChangeAddressStore";
import { ReceivingAddressStore } from "../bc_wallet/ReceivingAddressStore";
import { WalletAccount } from "../bc_wallet/WalletAccount";
import { WalletAccountTrxRepository } from "../bc_wallet_trx_repo/WalletAccountTrxRepository";
import { IUtxoCollector } from "./IUtxoCollector";

export class HdWalletAccountUtxoCollector implements IUtxoCollector {
	private trxRepo : WalletAccountTrxRepository;
	private receivingAddresses : ReceivingAddressStore;
	private changeAddresses : ChangeAddressStore;

	private changeaddr : boolean;
	private butxoList : ArrayList<BalanceUtxo>;
	private cursor : number;

    constructor(account : WalletAccount){
        this.trxRepo = account.getWalletAccountTrxRepository();
        this.receivingAddresses = account.getReceivingAddresses();
        this.changeAddresses = account.getChangeAddresses();

        this.changeaddr = false;
        this.cursor = 0;
        this.butxoList = new ArrayList<BalanceUtxo>();

        this.importReceivingUtxos();
    }

    public hasNext() : boolean {
        if(!this.changeaddr){
            if(this.butxoList.size() > this.cursor){
                return true;
            }

            this.changeaddr = true;
            this.cursor = 0;
            this.importChangeUtxos();
        }

        return this.butxoList.size() > this.cursor;
    }

    public next() : BalanceUtxo {
        let utxo = this.butxoList.get(this.cursor);
        this.cursor++;

        if(utxo != null){
            return <BalanceUtxo>(utxo.copyData());
        }
        throw new NullPointerException("HdWalletAccountUtxoCollector.next()");
    }

    private importReceivingUtxos() : void {
        this.butxoList.reset();

        let maxLoop = this.receivingAddresses.size();
        for(let i = 0; i != maxLoop; ++i){
            let addr = this.receivingAddresses.getAddress(i);
            let desc = addr.toAddressDescriptor();

            let list = this.trxRepo.getBalanceUtxos(desc);
            if(list != null){
                this.butxoList.addAll(list);
            }
        }

    }

    private importChangeUtxos() : void {
        this.butxoList.reset();

        let maxLoop = this.changeAddresses.size();
        for(let i = 0; i != maxLoop; ++i){
            let addr = this.changeAddresses.getAddress(i);
            let desc = addr.toAddressDescriptor();

            let list = this.trxRepo.getBalanceUtxos(desc);
            if(list != null){
                this.butxoList.addAll(list);
            }
        }
    }

}