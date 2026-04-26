import { Schnorr, SchnorrConsts } from "../../../base/crypto/Schnorr"

describe('SchnorrTestGroup test', () => {
    it('SchnorrTestGroup', () => {
       let key = Schnorr.generateKeyRandom();

       let ans = SchnorrConsts.G.modPow(key.secretKey, SchnorrConsts.Q);

       let bl = ans.equals(key.publicKey);
       expect(bl).toBe(true);
    })
})
