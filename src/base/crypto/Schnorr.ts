import { BigInteger } from "../../db/numeric/BigInteger";

export class SchnorrConsts {
    public static readonly Q : BigInteger = new BigInteger(0xff66c4652cbb54e13e4cc75898014aef72332e147343a95031cf416ca9f77ce7n);
    public static readonly Q_1 : BigInteger = new BigInteger(0xff66c4652cbb54e13e4cc75898014aef72332e147343a95031cf416ca9f77ce6n);
    public static readonly G : BigInteger = new BigInteger(0xe000000000000000000000000000000000000000000000000000000000000002n)
}

export class Schnorr {
    public static readonly keyLength = 256;

    
}

