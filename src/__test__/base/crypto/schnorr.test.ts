import { Schnorr, SchnorrConsts } from "../../../base/crypto/Schnorr"

describe('SchnorrTestGroup test', () => {
    it('generateKey', () => {
       let key = Schnorr.generateKeyRandom();

       let ans = SchnorrConsts.G.modPow(key.secretKey, SchnorrConsts.Q);

       let bl = ans.equals(key.publicKey);
       expect(bl).toBe(true);
    })

    it('sign01', () => {
        for(let i = 0; i != 10; ++i){
            let key = Schnorr.generateKeyRandom();

            let datastr = "asdfghjjklqwertyuiopzxcvbnm,./poiiuuuytrtrree";
            let testData = new TextEncoder().encode(datastr);
            let length = testData.length;

            let sig = Schnorr.sign(key.secretKey, key.publicKey, testData, length);

            let result = Schnorr.verifySig(sig, key.publicKey, testData, length);
            expect(result).toBe(true);
        }
    })
})
