import { Secp256k1Point } from "./Secp256k1Point";


export class ScPublicKey extends Secp256k1Point {
    constructor(){
        super(Secp256k1Point.gX, Secp256k1Point.gY);
    }


}