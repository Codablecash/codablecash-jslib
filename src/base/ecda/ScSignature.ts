import { BigInteger } from "../../db/numeric/BigInteger";
import { Secp256k1Point } from "./Secp256k1Point";

export class ScSignature {
    private e : BigInteger;
    private y : BigInteger;

    constructor(e : BigInteger, y : BigInteger){
        this.e = e.copy();
        this.y = y.copy();
    }

    public sign() : void {
        let G = Secp256k1Point.getBasePoint();

        let r = BigInteger.ramdom().mod(Secp256k1Point.p);

        let rG = G.multiple(r);

        
    }
}