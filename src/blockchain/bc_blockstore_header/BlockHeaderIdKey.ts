import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { AbstractBtreeKey } from "../../db/btree/AbstractBtreeKey";
import { BlockHeaderId } from "../bc_block/BlockHeaderId";
import { BlockHeaderIdKeyFactory } from "./BlockHeaderIdKeyFactory";


export class BlockHeaderIdKey extends AbstractBtreeKey {
    private headerId : BlockHeaderId;

    constructor(headerId : BlockHeaderId) {
        super();
        this.headerId = <BlockHeaderId>headerId.copyData();
    }

    public isInfinity(): boolean {
        return false;
    }
    public isNull(): boolean {
        return false;
    }

    public binarySize() : number {
        let size = 4; //sizeof(uint32_t);

        size += this.headerId.binarySize();

        return size;
    }

    public toBinary(out : ByteBuffer) : void {
        out.putInt(BlockHeaderIdKeyFactory.BLOCK_HEADER_ID_KEY);

        this.headerId.toBinary(out);
    }

    public static fromBinary(input : ByteBuffer) : BlockHeaderIdKey {
        let headerId = BlockHeaderId.fromBinary(input);

        return new BlockHeaderIdKey(headerId);
    }

    public compareTo(key : AbstractBtreeKey) : number {
        if(key.isInfinity()){
            return -1;
        }
        else if(key.isNull()){
            return 1;
        }

        let other = <BlockHeaderIdKey>(key);
        return this.headerId.compareTo(other.headerId);
    }

    public clone() : AbstractBtreeKey {
        return new BlockHeaderIdKey(this.headerId);
    }

}