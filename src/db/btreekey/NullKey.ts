import { ByteBuffer } from "../base_io/ByteBuffer";
import { AbstractBtreeKey } from "../btree/AbstractBtreeKey";
import { BtreeKeyFactory } from "./BtreeKeyFactory";

export class NullKey extends AbstractBtreeKey {


    public binarySize(): number {
        let size = 4;
        return size;
    }
    public toBinary(out: ByteBuffer): void {
        out.putInt(BtreeKeyFactory.NULL_KEY);
    }
    public static fromBinary(input : ByteBuffer) : NullKey {
        return new NullKey();
    }
    
    public isInfinity(): boolean {
        return false;
    }
    public isNull(): boolean {
        return true;
    }

    public compareTo(key : AbstractBtreeKey): number {
        if(key.isNull()){
            return 0;
        }
        return -1;
    }
    public clone(): AbstractBtreeKey {
        return new NullKey();
    }

}
