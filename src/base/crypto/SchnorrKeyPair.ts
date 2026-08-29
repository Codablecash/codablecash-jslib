import { NullPointerException } from "../../db/base/NullPointerException";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { BigInteger } from "../../db/numeric/BigInteger";
import { IKeyPair } from "./IKeyPair";


export class SchnorrKeyPair extends IKeyPair {
    public static readonly PAIR_SCHNORR : number = 1;

    public secretKey: BigInteger | null;
    public publicKey: BigInteger | null;

    constructor(secretKey? : BigInteger, publicKey? : BigInteger){
        super();
        if(secretKey != null && publicKey != null){
            this.secretKey = secretKey.copy();
            this.publicKey = publicKey.copy();
        }
        else {
            this.secretKey = null;
            this.publicKey = null;
        }
    }

    public getPubKey(): BigInteger {
        if(this.publicKey != null){
            return this.publicKey;
        }
        throw new NullPointerException("SchnorrKeyPair.getPubKey()");
    }
    public getSecretKey(): BigInteger {
        if(this.secretKey != null){
            return this.secretKey;
        }
        throw new NullPointerException("SchnorrKeyPair.getSecretKey()");
    }

    public clone() : SchnorrKeyPair {
        if(this.publicKey != null && this.secretKey != null){
            return new SchnorrKeyPair(this.secretKey, this.publicKey);
        }
        throw new NullPointerException("SchnorrKeyPair.clone()");
    }

    public binarySize() : number {
        if(this.publicKey != null && this.secretKey != null){
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
        throw new NullPointerException("SchnorrKeyPair.binarySize()");
    }

    public toBinary(out : ByteBuffer){
        if(this.publicKey != null && this.secretKey != null){
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
        throw new NullPointerException("SchnorrKeyPair.binarySize()");
    }

    public fromBinary(input: ByteBuffer): void {
        {
            let length = input.getShort();
            let buff = input.getByteBuffer(length);

            this.publicKey = buff.toBigInteger();
        }

        {
            let length = input.getShort();
            let buff = input.getByteBuffer(length);

            this.secretKey = buff.toBigInteger();
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

