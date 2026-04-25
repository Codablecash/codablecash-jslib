import { BigInteger } from "../../db/numeric/BigInteger";
import { ScPublicKey } from "./ScPublicKey";
import { Secp256k1Point } from "./Secp256k1Point";


export class ScPrivateKey {
    public static p = new BigInteger(0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2Fn);

    private keyvalue : BigInteger;

    constructor(seed = BigInteger.ramdom(), solt : bigint = 1n) {
        let pow = new BigInteger(solt);

        this.keyvalue = seed.multiply(pow).mod(ScPrivateKey.p);
    }

    public generatePublicKey() : ScPublicKey {
        let BASE_POINT = Secp256k1Point.getBasePoint();
        let pt = BASE_POINT.multiple(this.keyvalue);

        return new ScPublicKey(pt);
    }

    public compareTo(other : ScPrivateKey) : number {
        return this.keyvalue.compareTo(other.keyvalue);
    }
}