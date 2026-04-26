import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { BigInteger } from "../../db/numeric/BigInteger";


export class SchnorrSignature {
    private e : BigInteger;
    private y : BigInteger;

    constructor(e : BigInteger, y : BigInteger) {
        this.e = e.copy();
        this.y = y.copy();
    }

    public binarySize() : number {
        let total = 1; // uint8_t
        total += this.e.binarySize();

        total += 1;
        total += this.y.binarySize();

        return total;
    }

    public toBinary(out : ByteBuffer) : void {
        let ebuff = this.e.toBinary();
        ebuff.position(0);
        out.put(ebuff.limit());
        out.putByteBuffer(ebuff);

        let ybuff = this.e.toBinary();
        ybuff.position(0);
        out.put(ybuff.limit());
        out.putByteBuffer(ybuff);
    }

    public static createFromBinary(input : ByteBuffer) {
        let e = SchnorrSignature.loadBinary(input);
        let y = SchnorrSignature.loadBinary(input);

        return new SchnorrSignature(e, y);
    }

    private static loadBinary(input: ByteBuffer) {
        let size = input.get();

        let buffer = input.getByteBuffer(size);

        return buffer.toBigInteger();
    } 
}