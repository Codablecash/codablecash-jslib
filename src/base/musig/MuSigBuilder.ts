import { ArrayList } from "../../db/base/ArrayList";
import { BigInteger } from "../../db/numeric/BigInteger";
import { Secp256k1Point } from "../ecda/Secp256k1Point";
import { IMuSigSigner } from "./IMuSigSigner";
import { MuSigHashBuilder } from "./MuSigHashBuilder";


export class MuSigBuilder {
    private signers : ArrayList<IMuSigSigner>;
    private L : BigInteger;
    private XiList : ArrayList<Secp256k1Point>;

    private X : Secp256k1Point;
    private R : Secp256k1Point;
    private s : BigInteger;

    constructor(){
        this.L = new BigInteger(0n);
        this.s = new BigInteger(0n);
        this.X = new Secp256k1Point();
        this.R = new Secp256k1Point();

        this.signers = new ArrayList<IMuSigSigner>();
        this.XiList = new ArrayList<Secp256k1Point>();
    }

    public addSigner(signer : IMuSigSigner) : void {
        this.signers.addElement(signer);
    }

    public sign(data : Uint8Array, length : number) {
        // Xi = xG
        // Call L = H(X1,X2,…)
        this.calcL();

        // Call X the sum of all H(L,Xi)Xi
        this.calcX();

        // Each signer chooses a random nonce ri, and shares Ri = riG with the other signers
        // Call R the sum of the Ri points
        this.calcR();

        // Each signer computes si = ri + H(X,R,m)H(L,Xi)xi
        // The final signature is (R,s) where s is the sum of the si values
        this.calcs(data, length);

        // FIXME return MuSig(this->R, this->s);
    }

    public calcL() : void {
        const hashBuilder = new MuSigHashBuilder();

        const maxLoop = this.signers.size();
        for(let i = 0; i != maxLoop; ++i){
            const signer = this.signers.get(i);

            let Xi = signer.getxG();
            hashBuilder.add(Xi);
            this.XiList.addElement(Xi.copy())
        }
        hashBuilder.buildHash();

        this.L = hashBuilder.getResultAsBigInteger();
    }

    // Call X the sum of all H(L,Xi)Xi
    public calcX() : void {
        let result = new Secp256k1Point(Secp256k1Point.Zero, Secp256k1Point.Zero);

        let maxLoop = this.XiList.size();
        for(let i = 0; i != maxLoop; ++i){
            let Xi = this.XiList.get(i);

            const hashBuilder = new MuSigHashBuilder();
            hashBuilder.addBigInteger(this.L);
            hashBuilder.add(Xi);
            hashBuilder.buildHash();

            let hash = hashBuilder.getResultAsBigInteger();
            let value = Xi.multiple(hash);

            result = result.add(value);
        }
    }

    public calcR() : void {
        let result = new Secp256k1Point(Secp256k1Point.Zero, Secp256k1Point.Zero);

        let maxLoop = this.signers.size();
        for(let i = 0; i != maxLoop; ++i){
            let signer = this.signers.get(i);

            let Ri = signer.getrG();
            result = result.add(Ri);
        }

        this.R = result;
    }

    public calcs(data : Uint8Array, length : number) : void {

    }

}