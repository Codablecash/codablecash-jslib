import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { BigInteger } from "../../db/numeric/BigInteger";

export class Abstract32BytesId {

    public id : ByteBuffer; // 32 bytes

    constructor(binary : Uint8Array, length : number) {
        this.id = ByteBuffer.wrapWithEndian(binary, length, true);
    }

    public size() : number {
        return this.id.limit();
    }

    public toArray() {
        return this.id.toUint8Array();
    }

    public binarySize() : number {
        let total = 4; // sizeof(int32_t);
        total += this.id.capacity();

        return total;
    }

    public toBinary(out : ByteBuffer) : void {
        let cap = this.id.capacity();
        out.putInt(cap);

        this.id.position(0);
        out.putByteBuffer(this.id);
    }

    public equals(other : Abstract32BytesId) : boolean {
        return this.id.binaryEquals(other.id);
    }

    public compareTo(other : Abstract32BytesId) : number {
        return this.id.binaryCmp(other.id);
    }

    public toBigInteger() : BigInteger {
        let ret = BigInteger.fromBinary(this.id);
        return ret;
    }

    public toString() : string {
        let bigInt = this.toBigInteger();

        let str = bigInt.toString(16);
        return str;
    }

    public hashCode() : number {
        this.id.position(0);
        let bint = BigInteger.fromBinary(this.id);
        let hash = bint.toNumber();
        return hash;
    }

}
