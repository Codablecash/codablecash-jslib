import { ByteBuffer } from "../base_io/ByteBuffer";
import { AbstractBtreeKey } from "../btree/AbstractBtreeKey";
import { BtreeKeyFactory } from "./BtreeKeyFactory";

export class ULongKey extends AbstractBtreeKey {
    private value : bigint;

    constructor(v : number | bigint) {
        super();

        if(typeof v == "number"){
            this.value = BigInt(v);
        }
        else {
            this.value = v;
        }
    }

    public getValue() {
        return this.value;
    }
    public setValue(v : number | bigint) {
        if(typeof v == "number"){
            this.value = BigInt(v);
        }
        else {
            this.value = v;
        } 
    }

    public binarySize(): number {
        let size : number = 4;
        size += 8; // value

        return size;
    }
    public toBinary(out : ByteBuffer): void {
        out.putInt(BtreeKeyFactory.ULONG_KEY);
        out.putLong(this.value);
    }
    public static fromBinary(input : ByteBuffer) : ULongKey {
        let value = input.getLong();
        return new ULongKey(value);
    }

    public isInfinity(): boolean {
        return false;
    }
    public isNull(): boolean {
        return false;
    }
    public compareTo(key : AbstractBtreeKey): number {
        if(key.isInfinity()){
            return -1;
        }
        else if(key.isNull()){
            return 1;
        }

        let ulkey = <ULongKey>(key);

        return this.value > ulkey.value ? 1 : (this.value == ulkey.value ? 0 : -1);
    }
    public clone(): AbstractBtreeKey {
        return new ULongKey(this.value);
    }

}
