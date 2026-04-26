import { ArrayList } from "../../db/base/ArrayList";
import { BigInteger } from "../../db/numeric/BigInteger";
import { Secp256k1Point } from "../ecda/Secp256k1Point";
import { IMuSigSigner } from "./IMuSigSigner";


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

    
}