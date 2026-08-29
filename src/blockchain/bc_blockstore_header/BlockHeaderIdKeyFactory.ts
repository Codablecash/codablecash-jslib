import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { AbstractBtreeKey } from "../../db/btree/AbstractBtreeKey";
import { BtreeKeyFactory } from "../../db/btreekey/BtreeKeyFactory";
import { BlockHeaderIdKey } from "./BlockHeaderIdKey";

export class BlockHeaderIdKeyFactory extends BtreeKeyFactory {
    public static BLOCK_HEADER_ID_KEY = 0x14;

    public fromBinary(keyType : number, input : ByteBuffer) : AbstractBtreeKey {
        if(keyType == BlockHeaderIdKeyFactory.BLOCK_HEADER_ID_KEY){
            return BlockHeaderIdKey.fromBinary(input);
        }

        return super.fromBinary(keyType, input);
    }

    public copy() : BtreeKeyFactory {
        return new BlockHeaderIdKeyFactory();
    }
}