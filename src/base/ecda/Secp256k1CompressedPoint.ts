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

    public static compress(pt : Secp256k1Point) : Secp256k1CompressedPoint {
        let x = pt.getX();
        let y = pt.getY();

        let MOD = y.mod(BigInteger.TWO);
        let prefix = MOD.equals(BigInteger.ZERO) ? Secp256k1CompressedPoint.COMPRESS_Y_EVEN : Secp256k1CompressedPoint.COMPRESS_Y_ODD;

        return new Secp256k1CompressedPoint(x, prefix);
    }

    public decompress() : Secp256k1Point {
        const three = new BigInteger(3n);
        const seven = new BigInteger(7n);
        const four = new BigInteger(4n);

        let y_sq = this.x.modPow(three, Secp256k1Point.p).add(seven).mod(Secp256k1Point.p);

        let P_1 = Secp256k1Point.p.add(BigInteger.ONE).shiftRight(2);
        let y = y_sq.modPow(P_1, Secp256k1Point.p);

        let ymod : number = y.mod(BigInteger.TWO).toNumber();
    
        if(ymod != (this.prefix % 2)){
            y = Secp256k1Point.p.subtract(y).mod(Secp256k1Point.p);
        }

        return new Secp256k1Point(this.x, y);
    }
}

