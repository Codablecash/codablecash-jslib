import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { BigInteger } from "../../db/numeric/BigInteger";

export class Abstract32BytesId {
    public static Q : BigInteger = new BigInteger("ff66c4652cbb54e13e4cc75898014aef72332e147343a95031cf416ca9f77ce7", 16);
    public static G : BigInteger = new BigInteger("e000000000000000000000000000000000000000000000000000000000000002", 16);

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

    public makeRandom16Bytes() : ByteBuffer {
        let size = 0;
        let p = new BigInteger("0");
        do{
            let sbint = BigInteger.getRandomBigInt(256);

            let seed = new BigInteger(sbint);

            let s = seed.mod(Abstract32BytesId.Q);
            p = Abstract32BytesId.G.modPow(s, Abstract32BytesId.Q);
            size = p.binarySize();
        } while(size != 32);

        let buff = p.toBinary();
        buff.position(0);

        return buff;
    }
}
