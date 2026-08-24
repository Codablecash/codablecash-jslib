import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { AbstractConfigStoreElement } from "./AbstractConfigStoreElement";

export class LongValueConfigStoreValue extends AbstractConfigStoreElement {
    protected value : bigint;

    constructor(value? : number | bigint){
        super(AbstractConfigStoreElement.TYPE_LONG_VALUE);
        if(value == undefined){
            this.value = 0n;
        }
        else if(typeof value == "number"){
            this.value = BigInt(value);
        }else{
            this.value = value;
        }
    }

    public getValue() : bigint {
        return this.value;
    }

    public binarySize() : number {
        return 1 + 8; // sizeof(uint8_t) + sizeof(uint64_t);
    }
    public toBinary(out: ByteBuffer) : void {
        out.put(this.type);
        out.putLong(this.value);
    }
    public fromBinary(input: ByteBuffer) : void {
        this.value = input.getLong();
    }
}