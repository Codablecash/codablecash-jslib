import { Sha256 } from "../../../base/crypto/Sha256";

describe('TestSha256Group', () => {
    it('case01' , () => {
        let str = "hello";
        let binary = Buffer.from(str, "utf8");

        let buff = Sha256.sha256(binary, true);

        let out = buff.toUint8Array();

        let result = "";
        for(let i = 0; i != out.length; ++i){
            let ch = out[i];

            result += ch.toString(16).padStart(2, "0");
        }

        const ans = "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824";
        expect(result == ans).toBe(true);
    })
})

