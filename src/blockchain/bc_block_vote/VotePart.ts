import { ArrayList } from "../../db/base/ArrayList";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { BlockHeaderId } from "../bc_block/BlockHeaderId";
import { VoteBlockTransaction } from "../bc_finalizer_trx/VoteBlockTransaction";
import { TransactionId } from "../bc_trx/TransactionId";
import { VotedHeaderIdGroup } from "./VotedHeaderIdGroup";


export class VotePart {
	private list : ArrayList<BlockHeaderId>;
	private map : Map<BlockHeaderId, VotedHeaderIdGroup>;

    constructor() {
        this.list = new ArrayList<BlockHeaderId>;
        this.map = new Map<BlockHeaderId, VotedHeaderIdGroup>();
    }

    public addVote(trx : VoteBlockTransaction) : void {
        let headerId = trx.getVotedHeaderId();

        let group = this.map.get(headerId);
        if(group == null){
            group = new VotedHeaderIdGroup(headerId);

            this.list.addElement(<BlockHeaderId>(headerId.copyData()));
            this.map.set(headerId, group);
        }

        let trxId = trx.getTransactionId();
        group.add(trxId);
    }

    public binarySize() : number {
        let total = 1; //sizeof(uint8_t);

        let maxLoop = this.list.size();
        for(let i = 0; i != maxLoop; ++i){
            let headerId = this.list.get(i);

            if(headerId != null){ // guard
                let group = this.map.get(headerId);
                total += group != null ? group.binarySize() : 0;
            }
        }

        return total;
    }

    public toBinary(out : ByteBuffer) : void {
        let maxLoop = this.list.size();
        out.put(maxLoop);

        for(let i = 0; i != maxLoop; ++i){
            let headerId = this.list.get(i);

            if(headerId != null){ // guard
                let group = this.map.get(headerId);
                group?.toBinary(out);
            }
        }
    }

    public static createFromBinary(input : ByteBuffer) : VotePart {
        let part = new VotePart();

        let maxLoop = input.get();

        for(let i = 0; i != maxLoop; ++i){
            let group = VotedHeaderIdGroup.createFromBinary(input);
            let headerId = group.getBlockHeaderId();

            part.list.addElement(<BlockHeaderId>(headerId.copyData()));
            part.map.set(headerId, group);
        }

        return part;
    }
}