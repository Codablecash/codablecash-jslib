import { IComparable } from "../../db/base/IComparable";
import { BigInteger } from "../../db/numeric/BigInteger";
import { Secp256k1Point } from "../ecda/Secp256k1Point";

export interface IMuSigSigner extends IComparable {
    getxG() : Secp256k1Point;
    getrG() : Secp256k1Point;

    gets(HXRm : BigInteger, L : BigInteger) : BigInteger;
}

