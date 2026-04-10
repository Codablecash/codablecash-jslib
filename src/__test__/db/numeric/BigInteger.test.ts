import { ByteBuffer } from "../../../db/base_io/ByteBuffer";
import { BigInteger } from "../../../db/numeric/BigInteger"



describe('BigInteger test', () => {
  it('mod inverse', () => {
    let a = new BigInteger(3n);
    let m = new BigInteger(11n);

    let ans = a.modInverse(m);
    console.log(ans);

    let av = ans.getValue();
    expect(av).toBe(4n);
  })
 
  it('binary 01', () => {
    // let a : BigInteger = new BigInteger(0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798n);
    let a : BigInteger = new BigInteger(0x01020304n);

    let num = a.binarySize();
    let buff : ByteBuffer = a.toBinary();

    let b : BigInteger = buff.toBigInteger();

    let ans = a.equals(b);

    expect(a.equals(b)).toBe(true);
  })

  it('binary 02', () => {
    let a : BigInteger = new BigInteger(0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798n);

    let num = a.binarySize();
    let buff : ByteBuffer = a.toBinary();

    let b : BigInteger = buff.toBigInteger();

    let ans = a.equals(b);

    expect(a.equals(b)).toBe(true);
  })
})
