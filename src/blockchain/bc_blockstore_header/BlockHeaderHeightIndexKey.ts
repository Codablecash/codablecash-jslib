import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { AbstractBtreeKey } from "../../db/btree/AbstractBtreeKey";
import { BlockHeaderHeightIndexKeyFactory } from "./BlockHeaderHeightIndexKeyFactory";


export class BlockHeaderHeightIndexKey extends AbstractBtreeKey {
	protected value : number;
	protected fpos : number;

    constructor(value : number, fpos? : number){
        super();
        this.value = value;

        if(fpos != undefined){
            this.fpos = fpos;
        }else{
            this.fpos = 0;
        }
    }

    public isInfinity() : boolean { return false; }
	public isNull() : boolean { return false; }

    public binarySize() : number {
        let size = 4; // sizeof(uint32_t);
        size += 8 + 8; // sizeof(this.value) + sizeof(this.fpos);
        return size;
    }

    public toBinary(out : ByteBuffer) : void {
        out.putInt(BlockHeaderHeightIndexKeyFactory.HEIGHT_INDEX_KEY);
        out.putLong(this.value);
        out.putLong(this.fpos);
    }

    public static fromBinary(input : ByteBuffer) : BlockHeaderHeightIndexKey {
        let value = input.getLong();
        let fpos = input.getLong();

        return new BlockHeaderHeightIndexKey(Number(value), Number(fpos));
    }

    public compareTo(key : AbstractBtreeKey) : number {
        if(key.isInfinity()){
            return -1;
        }
        else if(key.isNull()){
            return 1;
        }

        let ulkey = <BlockHeaderHeightIndexKey>(key);

        return this.value == ulkey.value ? 0 : (this.value > ulkey.value ? 1 : -1);
    }

    public clone() : AbstractBtreeKey {
        return new BlockHeaderHeightIndexKey(this.value, this.fpos);
    }
}