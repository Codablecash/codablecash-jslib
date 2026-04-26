import { BigInteger } from "../../db/numeric/BigInteger";
import { Secp256k1Point } from "./Secp256k1Point";

export class Secp256k1CompressedPoint {
    public static readonly COMPRESS_Y_EVEN : number = 2;
    public static readonly COMPRESS_Y_ODD : number = 3;

    private prefix : number;
    private x : BigInteger;

    constructor(x : BigInteger, prefix : number) {
        this.x = x.copy();
        this.prefix = prefix;
    }

    public compress(pt : Secp256k1Point) : Secp256k1CompressedPoint {
        let x = pt.getX();
        let y = pt.getY();

        let MOD = y.mod(BigInteger.TWO);
        let prefix = MOD.equals(BigInteger.ZERO) ? Secp256k1CompressedPoint.COMPRESS_Y_EVEN : Secp256k1CompressedPoint.COMPRESS_Y_ODD;

        return new Secp256k1CompressedPoint(x, prefix);
    }
}

