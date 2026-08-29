import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { AbstractConfigStoreElement } from "./AbstractConfigStoreElement";

export class ShortValueConfigStoreValue extends AbstractConfigStoreElement {
    private value : number;

    constructor(value? : number){
        super(AbstractConfigStoreElement.TYPE_SHORT_VALUE);
        if(value == undefined){
            this.value = 0;
        }else{
            this.value = value;
        }
    }
    public getValue() : number {
        return this.value;
    }

    public binarySize(): number {
       return 1 + 2; // sizeof(uint8_t) + sizeof(int16_t);
    }
    public toBinary(out: ByteBuffer): void {
        out.put(this.type);
	    out.putShort(this.value);
    }
    public fromBinary(input: ByteBuffer): void {
        this.value = input.getShort();
    }
}