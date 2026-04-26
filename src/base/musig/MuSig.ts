import { ArrayList } from "../../db/base/ArrayList";
import { BigInteger } from "../../db/numeric/BigInteger";
import { Secp256k1Point } from "../ecda/Secp256k1Point";
import { MuSigHashBuilder } from "./MuSigHashBuilder";

export class MuSig {
    private R : Secp256k1Point;
    private s : BigInteger;
    private XiList : ArrayList<Secp256k1Point>;

    constructor(R : Secp256k1Point, s : BigInteger){
        this.R = R.copy();
        this.s = s.copy();
        this.XiList = new ArrayList<Secp256k1Point>();
    }

    public toString() : string {
        let ret = "R :";

        return ret;
    }

    public addXi(Xi : Secp256k1Point) : void {
        this.XiList.addElement(Xi);
    }

    /**
     *  * Call L = H(X1,X2,…)
     * Call X the sum of all H(L,Xi)Xi
     *
     * sG = R + H(X,R,m)X
     */
    public verify(data : Uint8Array, length : number) {
        let X = this.calcX();

        let G = new Secp256k1Point();
        let sG = G.multiple(this.s);

        let HXRm = new BigInteger(0n);
        {
            let hashBuilder = new MuSigHashBuilder();
            hashBuilder.add(X);
            hashBuilder.add(this.R);
            hashBuilder.addArray(data, length);
            hashBuilder.buildHash();
            HXRm = hashBuilder.getResultAsBigInteger();   
        }

        let result = X.multiple(HXRm);
        result = result.add(this.R);

        return result.equals(sG);
    }

    /**
     * Call X the sum of all H(L,Xi)Xi
     */
    public calcX() : Secp256k1Point {
        let L = this.calcL();

        let result = new Secp256k1Point(Secp256k1Point.Zero, Secp256k1Point.Zero);

        const maxLoop = this.XiList.size();
        for(let i = 0; i != maxLoop; ++i){
            let Xi = this.XiList.get(i);

            let hashBuilder = new MuSigHashBuilder();
            hashBuilder.addBigInteger(L);
            hashBuilder.add(Xi);
            hashBuilder.buildHash();

            let hash = hashBuilder.getResultAsBigInteger().mod(Secp256k1Point.n);
            let value = Xi.multiple(hash);

            result = result.add(value);
        }

        return result;
    }

    /**
     * 	Call L = H(X1,X2,…)
     */
    public calcL() : BigInteger {
        let hashBuilder = new MuSigHashBuilder();

        const maxLoop = this.XiList.size();
        for(let i = 0; i != maxLoop; ++i){
            let Xi = this.XiList.get(i);
            hashBuilder.add(Xi);
        }
        hashBuilder.buildHash();

        let L = hashBuilder.getResultAsBigInteger();
        return L;
    }
}
