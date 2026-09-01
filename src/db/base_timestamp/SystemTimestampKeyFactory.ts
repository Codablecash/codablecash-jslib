import { ByteBuffer } from "../base_io/ByteBuffer";
import { AbstractBtreeKey } from "../btree/AbstractBtreeKey";
import { BtreeKeyFactory } from "../btreekey/BtreeKeyFactory";
import { SystemTimestampKey } from "./SystemTimestampKey";


export class SystemTimestampKeyFactory extends BtreeKeyFactory {
    public static readonly SYSTEM_TIMESTAMP_KEY = 0x14;

    public fromBinary(keyType : number, input : ByteBuffer) : AbstractBtreeKey {
        if(keyType == SystemTimestampKeyFactory.SYSTEM_TIMESTAMP_KEY){
            let key = SystemTimestampKey.fromBinary(input);
            return key;
        }

        return super.fromBinary(keyType, input);
    }

    public copy() : BtreeKeyFactory {
        return new SystemTimestampKeyFactory();
    }
}