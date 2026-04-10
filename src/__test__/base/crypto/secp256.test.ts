import { Secp256k1Point } from "../../../base/ecda/Secp256k1Point";
import { BigInteger } from "../../../db/numeric/BigInteger";

describe('Secp256k1Point test', () => {
  it('checkBasePoint', () => {
    let gx = Secp256k1Point.gX;

    let right = gx.pow(3n).add(Secp256k1Point.b);
    right = right.mod(Secp256k1Point.p);

    let left = Secp256k1Point.gY.pow(2n).mod(Secp256k1Point.p);

    let bl = left.equals(right);
    expect(bl).toBe(true);
  })
 
})