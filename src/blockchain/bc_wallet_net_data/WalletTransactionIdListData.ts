import { ArrayList } from "../../db/base/ArrayList";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";
import { TransactionId } from "../bc_trx/TransactionId";

export class WalletTransactionIdListData implements IBlockObject {
	private list : ArrayList<TransactionId>;
	private index : number;

    constructor(){
        this.list = new ArrayList<TransactionId>();
        this.index = 0;
    }

	public next() : TransactionId | null {
		if(this.index == this.list.size()){
			return null;
		}
		return this.list.get(this.index++);
	}

    public join(value : WalletTransactionIdListData) : void {
        let newList = value.list;

        let maxLoop = newList.size();
        for(let i = 0; i != maxLoop; ++i){
            let v = newList.get(i);
            if(v != null && this.contains(v)){
                continue;
            }

            if(v != null){ // guard
                let element = <TransactionId>(v.copyData());
                this.list.addElement(element);
            }
        }
    }

    public contains(value : TransactionId) : boolean {
        let maxLoop = this.list.size();
        for(let i = 0; i != maxLoop; ++i){
            let v = this.list.get(i);
            if(v != null && v.equals(value)){
                return true;
            }
        }

        return false;
    }

    public remove(value : TransactionId) : void {
        let index = this.indexof(value);

        if(index >= 0){
            this.list.remove(index);
        }
    }

    public indexof(value : TransactionId) : number {
        let maxLoop = this.list.size();
        for(let i = 0; i != maxLoop; ++i){
            let v = this.list.get(i);
            if(v != null && v.equals(value)){
                return i;
            }
        }

        return -1;
    }

    public isEmpty() : boolean {
        return this.list.size() == 0;
    }

    public copyData() : IBlockObject {
        let data = new WalletTransactionIdListData();

        let maxLoop = this.list.size();
        for(let i = 0; i != maxLoop; ++i){
            let v = this.list.get(i);

            if(v != null){
                let trxId = <TransactionId>(v.copyData());
                data.add(trxId);
            }
        }

        return data;
    }

    public add(trxId : TransactionId) : void {
        this.list.addElement(<TransactionId>(trxId.copyData()));
    }

    public binarySize() : number {
        let total = 2; //sizeof(uint16_t);

        let maxLoop = this.list.size();
        for(let i = 0; i != maxLoop; ++i){
            let trxId = this.list.get(i);
            if(trxId != null){ // guard
                total += trxId.binarySize();
            }
        }

        return total;
    }

    public toBinary(out : ByteBuffer) : void {
        let maxLoop = this.list.size();
        out.putShort(maxLoop);

        for(let i = 0; i != maxLoop; ++i){
            let trxId = this.list.get(i);
            if(trxId != null){
                trxId.toBinary(out);
            }   
        }
    }

    public static fromBinary(input : ByteBuffer) : WalletTransactionIdListData {
        let data = new WalletTransactionIdListData();

        let maxLoop = input.getShort();
        for(let i = 0; i != maxLoop; ++i){
            let trxId = TransactionId.fromBinary(input);
            data.add(trxId);
        }

        return data;
    }
}