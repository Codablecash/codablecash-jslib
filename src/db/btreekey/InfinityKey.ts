import { ByteBuffer } from "../base_io/ByteBuffer";
import { AbstractBtreeKey } from "../btree/AbstractBtreeKey";
import { BtreeKeyFactory } from "./BtreeKeyFactory";


export class InfinityKey extends AbstractBtreeKey {


    public binarySize(): number {
        let size = 4;
        return size;
    }
    public toBinary(out: ByteBuffer): void {
        out.putInt(BtreeKeyFactory.INFINITY_KEY);
    }
    public static fromBinary(input : ByteBuffer) : InfinityKey {
        return new InfinityKey();
    }

    public isInfinity(): boolean {
        return true;
    }
    public isNull(): boolean {
        return false;
    }
    public compareTo(key : AbstractBtreeKey): number {
        if(key.isInfinity()){
            return 0;
        }
        return 1;
    }
    public clone(): AbstractBtreeKey {
        return new InfinityKey();
    }

}