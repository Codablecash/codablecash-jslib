import { BigInteger } from "../../db/numeric/BigInteger";
import { Secp256k1Point } from "../ecda/Secp256k1Point";
import { IMuSigSigner } from "./IMuSigSigner";
import { MuSigHashBuilder } from "./MuSigHashBuilder";


export class SimpleMuSigSigner implements IMuSigSigner {
    private x : BigInteger;
    private r : BigInteger;

    constructor(x: BigInteger){
        this.x = x.copy();
        this.r = new BigInteger(0n);
    }

    public getxG() : Secp256k1Point {
        let G = new Secp256k1Point();
        let xG = G.multiple(this.x);
        return xG;
    }

    public getrG() : Secp256k1Point{
        this.r = BigInteger.ramdom(new BigInteger(0n), Secp256k1Point.n);
        const G = new Secp256k1Point();

        return G.multiple(this.r);
    }

    gets(HXRm : BigInteger, L : BigInteger) : BigInteger {
        let Xi = this.getxG();

        let HLXi : BigInteger;
        {
            let hashBuilder = new MuSigHashBuilder();
            hashBuilder.addBigInteger(L);
            hashBuilder.add(Xi);
            hashBuilder.buildHash();
            
            HLXi = hashBuilder.getResultAsBigInteger();
        }

        let v2 = HXRm.multiply(HLXi).multiply(this.x);
        let ret = this.r.add(v2);

        return ret;
    }
}
