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

  it('checkOrder', () => {
    let pt = new Secp256k1Point();
    let Opt = new Secp256k1Point(Secp256k1Point.Zero, Secp256k1Point.Zero);

    let L = new BigInteger(Secp256k1Point.n.getValue());
    let mul = pt.multiple(L);

    let bl = Opt.equals(mul);
    expect(bl).toBe(true);
  })
 
  it('testDouble', () => {
    let pt = Secp256k1Point.getBasePoint();

    let pt2 = pt.add(pt);
    let pt4 = pt2.add(pt2);

    let ptadd4 = pt.add(pt).add(pt).add(pt);

    let bl = pt4.equals(ptadd4);
    expect(bl).toBe(true);
  })
})