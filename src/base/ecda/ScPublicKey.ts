import { Secp256k1Point } from "./Secp256k1Point";


export class ScPublicKey extends Secp256k1Point {

    constructor(pt : Secp256k1Point){
        super(pt.getX(), pt.getY());
    }

}
