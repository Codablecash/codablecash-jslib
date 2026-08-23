import { Sha256 } from "../../base/crypto/Sha256";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";

export class BloomFilter {
    private byteLength : number;
    private buffer : Uint8Array;
    private bitlength : number;

    constructor(byteLength : number) {
        this.byteLength = byteLength;
        this.buffer = new Uint8Array(byteLength);
        this.buffer.fill(0);

        this.bitlength = byteLength * 8;
    }

    public add(b : Uint8Array, length : number) {
        let bb = Sha256.sha256(b, true);
        bb.position(0);

        let l = BigInt(this.bitlength);

        let _v1 = (bb.getLong());
        let _v2 = (bb.getLong());
        let _v3 = (bb.getLong());

        let v1 = Number(_v1 % l);
        let v2 = Number(_v2 % l);
        let v3 = Number(_v3 % l);

        this.setBit(v1);
        this.setBit(v2);
        this.setBit(v3);
    }

    public setBit(pos : number) : void {
        let nbytes = pos / 8;
        let shift = pos % 8;

        let v = this.buffer[nbytes] | (1 << shift);
        this.buffer[nbytes] = v;
    }

    public hasBit(pos : number) : boolean {
        let nbytes = pos / 8;
        let shift = pos % 8;

        let filter = (1 << shift);
        let v = this.buffer[nbytes];

        return (v & filter) != 0;
    }

    public checkBytes(b : Uint8Array, length : number) {
        let bb = Sha256.sha256(b, true);
        bb.position(0);

        let l = BigInt(this.bitlength);

        let _v1 = (bb.getLong());
        let _v2 = (bb.getLong());
        let _v3 = (bb.getLong());

        let v1 = Number(_v1 % l);
        let v2 = Number(_v2 % l);
        let v3 = Number(_v3 % l);

        return this.__checkBytes(v1, v2, v3);
    }

    public __checkBytes(v1 : number, v2 : number, v3 : number) : boolean {
        let b1 = this.hasBit(v1);
        let b2 = this.hasBit(v2);
        let b3 = this.hasBit(v3);

        return b1 && b2 && b3;
    }

    protected __binarySize() : number {
        let total = 2; //sizeof(uint16_t);

        total += this.byteLength; // * sizeof(uint8_t)

        return total;
    }

    protected __toBinary(out : ByteBuffer) {
        out.putShort(this.byteLength);

        out.putArray(this.buffer, 0, this.byteLength);
    }

    protected __fromBinary(input : ByteBuffer) {
        this.byteLength = input.getShort();
        this.bitlength = this.byteLength * 8;

        this.buffer = input.getByteBuffer(this.byteLength).toUint8Array();
    }

    public equals(other : BloomFilter) : boolean {
        return this.byteLength == other.byteLength && this.bitlength == other.bitlength
                && this.filterBinaryEquals(other);
    }

    private filterBinaryEquals(other : BloomFilter) :boolean {
        //let ret = ::memcmp(this.buffer, other.buffer, this.byteLength);
        return this.buffer.every((val, index) => val == other.buffer[index]);
    }

}