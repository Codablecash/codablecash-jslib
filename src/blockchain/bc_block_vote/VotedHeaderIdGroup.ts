import { ArrayList } from "../../db/base/ArrayList";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { BlockHeaderId } from "../bc_block/BlockHeaderId";
import { TransactionId } from "../bc_trx/TransactionId";


export class VotedHeaderIdGroup {
	private votedHeaderId : BlockHeaderId;
	private trxIdList : ArrayList<TransactionId>;

    constructor(headerId : BlockHeaderId){
        this.votedHeaderId = <BlockHeaderId>(headerId.copyData());
        this.trxIdList = new ArrayList<TransactionId>();
    }

    public size() : number {
        return this.trxIdList.size();
    }

    public getBlockHeaderId() : BlockHeaderId {
        return this.votedHeaderId;
    }

    public add(trxId : TransactionId) : void {
        this.trxIdList.addElement(<TransactionId>trxId.copyData());
    }

    public binarySize() : number {
        let total = this.votedHeaderId.binarySize();

        let maxLoop = this.trxIdList.size();
        total += 1; // sizeof(uint8_t);

        for(let i = 0; i != maxLoop; ++i){
            let id = this.trxIdList.get(i);

            if(id != null){ // guard
                total += id.binarySize();
            }
        }

        return total;
    }

    public toBinary(out : ByteBuffer) : void {
        this.votedHeaderId.toBinary(out);

        let maxLoop = this.trxIdList.size();
        out.put(maxLoop);

        for(let i = 0; i != maxLoop; ++i){
            let id = this.trxIdList.get(i);

            if(id != null){ // guard
                id.toBinary(out);
            }
        }
    }

    public static createFromBinary(input : ByteBuffer) : VotedHeaderIdGroup {
        let headerId = BlockHeaderId.fromBinary(input);

        let group = new VotedHeaderIdGroup(headerId);

        let maxLoop = input.get();
        for(let i = 0; i != maxLoop; ++i){
            let id = TransactionId.fromBinary(input);

            group.add(id);
        }

        return group;
    }   
}