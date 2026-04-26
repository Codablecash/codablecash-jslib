import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { BigInteger } from "../../db/numeric/BigInteger";


export class SchnorrKeyPair {
    public static readonly PAIR_SCHNORR : number = 1;

    public secretKey: BigInteger;
    public publicKey: BigInteger;

    constructor(secretKey : BigInteger, publicKey : BigInteger){
        this.secretKey = secretKey.copy();
        this.publicKey = publicKey.copy();
    }

    public clone() : SchnorrKeyPair {
        return new SchnorrKeyPair(this.secretKey, this.publicKey);
    }

    public binarySize() : number {
        let total = 1;
        {
            let p = this.publicKey.toBinary();
            total += 2; // int16
            total += p.limit();
        }
        {
            let p = this.secretKey.toBinary();
            total += 2; // int16
            total += p.limit();
        }
        return total;
    }

    public toBinary(out : ByteBuffer){
        out.put(SchnorrKeyPair.PAIR_SCHNORR);

        {
            let p = this.publicKey.toBinary();

            out.putShort(p.capacity());
            out.putByteBuffer(p);
        }
        {
            let p = this.secretKey.toBinary();

            out.putShort(p.capacity());
            out.putByteBuffer(p);
        }
    }

    public static createFromBinary(input : ByteBuffer) : SchnorrKeyPair {
        const type = input.get();

        let cap = input.getShort();
        let pub = input.getByteBuffer(cap);
        let publicKey = pub.toBigInteger();

        cap = input.getShort();
        let sec = input.getByteBuffer(cap);
        let secretKey = sec.toBigInteger();

        return new SchnorrKeyPair(secretKey, publicKey);
    }
}

