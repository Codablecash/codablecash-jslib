import { IComparable } from "../../db/base/IComparable";
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
    public compareTo(other: IComparable | null): number {
        if(other == null){
            return 1;
        }

        let o = <SimpleMuSigSigner>other;
        let diff = this.x.compareTo(o.x);

        if(diff != 0){
            return diff;
        }
        return this.r.compareTo(o.r);
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

        let HLXi = new BigInteger(0n);
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
