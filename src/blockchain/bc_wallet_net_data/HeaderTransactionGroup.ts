import { ArrayList } from "../../db/base/ArrayList";
import { NullPointerException } from "../../db/base/NullPointerException";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";
import { BlockHeaderId } from "../bc_block/BlockHeaderId";
import { AbstractBlockchainTransaction } from "../bc_trx/AbstractBlockchainTransaction";
import { TransactionId } from "../bc_trx/TransactionId";

export class HeaderTransactionGroup{
	private headerId : BlockHeaderId | null;
	private list : ArrayList<AbstractBlockchainTransaction>;

    constructor(){
        this.headerId = null;
        this.list = new ArrayList<AbstractBlockchainTransaction>();
    }

    public getTransactionsList() : ArrayList<AbstractBlockchainTransaction> {
        return this.list;
    }

    public binarySize() : number {
        if(this.headerId != null){
            let total = 0;
            total += this.headerId.binarySize();

            let maxLoop = this.list.size();
            total += 2; // //sizeof(uint16_t);

            for(let i = 0; i != maxLoop; ++i){
                let trx = this.list.get(i);

                if(trx != null){ // guard
                    total += trx.binarySize();
                }
            }

            return total;
        }
        throw new NullPointerException("HeaderTransactionGroup.binarySize()");
    }

    public toBinary(out : ByteBuffer) : void {
        if(this.headerId != null){
            this.headerId.toBinary(out);

            let maxLoop = this.list.size();
            out.putShort(maxLoop);

            for(let i = 0; i != maxLoop; ++i){
                let trx = this.list.get(i);
                if(trx != null){
                    trx.toBinary(out);
                }
            }
        }
        throw new NullPointerException("HeaderTransactionGroup.toBinary()");
    }

    public static createFromBinary(input :ByteBuffer) : HeaderTransactionGroup {
        let group = new HeaderTransactionGroup();

        let headerId = BlockHeaderId.fromBinary(input);
        group.setHeaderId(headerId);

        let maxLoop = input.getShort();
        for(let i = 0; i != maxLoop; ++i){
            let trx = AbstractBlockchainTransaction.createFromBinary(input);

            group.addTransaction(trx);
        }

        return group;
    }

    public copyData() : IBlockObject {
        let inst = new HeaderTransactionGroup();
        inst.headerId = this.headerId != null ? <BlockHeaderId>this.headerId.copyData() : null;

        let maxLoop = this.list.size();
        for(let i = 0; i != maxLoop; ++i){
            let trx = this.list.get(i);

            if(trx != null){
                inst.addTransaction(trx);
            }
        }

        return inst;
    }

    public addTransaction(trx : AbstractBlockchainTransaction) : void {
        let t = <AbstractBlockchainTransaction>(trx.copyData());
        this.list.addElement(t);
    }

    public setHeaderId(headerId : BlockHeaderId) : void {
        this.headerId = <BlockHeaderId>(headerId.copyData());
    }

    public join(value : HeaderTransactionGroup) : void {
        let maxLoop = value.list.size();
        for(let i = 0; i != maxLoop; ++i){
            let v =  value.list.get(i);

            if(v != null && this.contains(v)){
                continue;
            }

            if(v != null){
                let newTrx = <AbstractBlockchainTransaction>(v.copyData());
                this.list.addElement(newTrx);
            }
        }
    }

    public contains(trx : AbstractBlockchainTransaction) : boolean {
        let trxId = trx.getTransactionId();

        let maxLoop = this.list.size();
        for(let i = 0; i != maxLoop; ++i){
            let v = this.list.get(i);

            if(v != null){ // guard
                let vId = v.getTransactionId();
                if(trxId.equals(vId)){
                    return true;
                }
            }
        }

        return false;
    }

    public remove(trxId : TransactionId) : void {
        let index = this.indexof(trxId);

        if(index >= 0){
            this.list.remove(index);
        }
    }

    public indexof(trxId : TransactionId) : number {
        let maxLoop = this.list.size();
        for(let i = 0; i != maxLoop; ++i){
            let v = this.list.get(i);

            if(v != null){ // guard
                let id = v.getTransactionId();
                if(trxId.equals(id)){
                    return i;
                }
            }
        }

        return -1;
    }
}