import { NullPointerException } from "../../db/base/NullPointerException";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { AbstractConfigStoreElement } from "./AbstractConfigStoreElement";

export class BinaryValueConfigStoreValue extends AbstractConfigStoreElement {
    private data : Uint8Array | null;
    private length : number;

    constructor(){
        super(AbstractConfigStoreElement.TYPE_BINARY_VALUE);

        this.data = null;
        this.length = 0;
    }

    public init(data : Uint8Array, length : number) : void {
        this.length = length;
        this.data = data.slice(0, length);
    }

    public binarySize(): number {
        let total = 1 + 2; //sizeof(uint8_t) + sizeof(int16_t);
        total += this.length;
        return total;
    }
    public toBinary(out: ByteBuffer): void {
        if(this.data != null){
            out.put(this.type);
            out.putShort(this.length);
            out.putArray(this.data, 0, this.length);
        }
        throw new NullPointerException("BinaryValueConfigStoreValue.toBinary()");
    }
    public fromBinary(input: ByteBuffer): void {
        this.length = input.getShort();
        this.data = input.getByteBuffer(this.length).toUint8Array();
    }

    public getLength() : number {
        return this.length;
    }
    public getData() : Uint8Array {
        if(this.data != null){
            return this.data;
        }
        throw new NullPointerException("BinaryValueConfigStoreValue.getData()");
    }
}