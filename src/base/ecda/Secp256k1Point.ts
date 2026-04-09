import { BigInteger } from "../../db/numeric/BigInteger";


export class Secp256k1Point {
    public static p = new BigInteger(0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2Fn);
    public static a = new BigInteger(0x0n);
    public static b = new BigInteger(0x7n);

    public static gX = new BigInteger(0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798n);
    public static gY = new BigInteger(0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8n);

    protected x : BigInteger;
    protected y : BigInteger;

    constructor(x : BigInteger, y : BigInteger){
        this.x = new BigInteger(x.getValue());
        this.y = new BigInteger(y.getValue());
    }

}
