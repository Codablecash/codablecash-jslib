import { ByteBuffer } from "../base_io/ByteBuffer";
import { AbstractBtreeKey } from "../btree/AbstractBtreeKey";
import { InfinityKey } from "./InfinityKey";
import { KeyFormatException } from "./KeyFormatException";
import { NullKey } from "./NullKey";
import { ULongKey } from "./ULongKey";

export class BtreeKeyFactory {
    static readonly NULL_KEY : number = 0x01;
    static readonly INFINITY_KEY : number = 0x02;
    static readonly ULONG_KEY : number = 0x03;

    public fromBinary(keyType : number, input : ByteBuffer) : AbstractBtreeKey {
        switch(keyType){
        case BtreeKeyFactory.NULL_KEY:
            return NullKey.fromBinary(input);
        case BtreeKeyFactory.INFINITY_KEY:
            return InfinityKey.fromBinary(input);
        case BtreeKeyFactory.ULONG_KEY:
            return ULongKey.fromBinary(input);
        default:
            break;
        }

        throw new KeyFormatException("Wrong key type.");
    }
}
