import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { AbstractBtreeKey } from "../../db/btree/AbstractBtreeKey";
import { BtreeKeyFactory } from "../../db/btreekey/BtreeKeyFactory";
import { BlockHeaderHeightIndexKey } from "./BlockHeaderHeightIndexKey";

export class BlockHeaderHeightIndexKeyFactory extends BtreeKeyFactory {
    public static HEIGHT_INDEX_KEY = 0x14;

    public fromBinary(keyType : number, input : ByteBuffer) : AbstractBtreeKey {
        if(keyType == BlockHeaderHeightIndexKeyFactory.HEIGHT_INDEX_KEY){
            return BlockHeaderHeightIndexKey.fromBinary(input);
        }

        return super.fromBinary(keyType, input);
    }

    public copy() : BtreeKeyFactory {
        return new BlockHeaderHeightIndexKeyFactory();
    }
}