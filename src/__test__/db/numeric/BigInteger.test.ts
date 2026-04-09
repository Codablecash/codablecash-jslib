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
 
})
