import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { BigInteger } from "../../db/numeric/BigInteger";
import { SchnorrKeyPair } from "./SchnorrKeyPair";

import sha256 from "fast-sha256";
import { SchnorrSignature } from "./SchnorrSignature";

export class SchnorrConsts {
    public static readonly Q : BigInteger = new BigInteger(0xff66c4652cbb54e13e4cc75898014aef72332e147343a95031cf416ca9f77ce7n);
    public static readonly Q_1 : BigInteger = new BigInteger(0xff66c4652cbb54e13e4cc75898014aef72332e147343a95031cf416ca9f77ce6n);
    public static readonly G : BigInteger = new BigInteger(0xe000000000000000000000000000000000000000000000000000000000000002n)
}

export class Schnorr {
    public static readonly keyLength = 256;

    public static generateKey(seed : BigInteger) : SchnorrKeyPair {
        let s  = seed.mod(SchnorrConsts.Q_1);

        let p = SchnorrConsts.G.modPow(s, SchnorrConsts.Q);

        return new SchnorrKeyPair(s, p);
    }

    public static generateKeyRandom() : SchnorrKeyPair {
        let s = BigInteger.ramdom();
        return this.generateKey(s);
    }

    public static sign(s : BigInteger, p : BigInteger, data : Uint8Array, size : number) : SchnorrSignature {
        let r = BigInteger.ramdom().modSelf(SchnorrConsts.Q_1);
        let powG = SchnorrConsts.G.modPow(r, SchnorrConsts.Q);

        let e : BigInteger;
        {
            let buff = powG.toBinary();

            let count = buff.capacity();
            const hashinLen = count + size;

            let hashinbuff = ByteBuffer.allocateWithEndian(hashinLen, true);
            let datab = Buffer.from(data);
            hashinbuff.putBuffer(datab);

            hashinbuff.putByteBuffer(buff);

            let hashindata = buff.toUint8Array();
            let shaData = sha256(hashindata);
            let shaDataBuff = Buffer.from(shaData);

            let hashByteBuffer = new ByteBuffer(shaData.length);
            hashByteBuffer.putBuffer(shaDataBuff);

            e = hashByteBuffer.toBigInteger();
        }

        powG = s.multiply(e);
        let y = r.subtractSelf(powG).modSelf(SchnorrConsts.Q_1);

        let sig = new SchnorrSignature(e, y);
        return sig;
    }

    public static verifySig(sig : SchnorrSignature, p : BigInteger, data : Uint8Array, size : number) {
        return this.verify(sig.e, sig.y, p, data, size);
    }

    public static verify(e : BigInteger, y : BigInteger, p : BigInteger, data : Uint8Array, size : number) : boolean {
        let eP = p.modPow(e, SchnorrConsts.Q);
        let yG = SchnorrConsts.G.modPow(y, SchnorrConsts.Q);
        let powG = eP.multiplySelf(yG).modSelf(SchnorrConsts.Q);

        let e2 : BigInteger;
        {
            let buff = powG.toBinary();

            let count = buff.capacity();
            let hashinLen = count + size;

            let hashinbuff = ByteBuffer.allocateWithEndian(hashinLen, true);
            let datab = Buffer.from(data);
            hashinbuff.putBuffer(datab);

            hashinbuff.putByteBuffer(buff);

            let hashindata = buff.toUint8Array();
            let shaData = sha256(hashindata);
            let shaDataBuff = Buffer.from(shaData);

            let hashByteBuffer = new ByteBuffer(shaData.length);
            hashByteBuffer.putBuffer(shaDataBuff);

            e2 = hashByteBuffer.toBigInteger();
            e2.modSelf(SchnorrConsts.Q);
        }

        let cmp = e.mod(SchnorrConsts.Q).compareTo(e2);
        return cmp == 0;
    }
}

