import { Aes256Cbc, Aes256CbcResult } from "../../../base/crypto/Aes256Cbc";

describe('TestAESGroup', () => {
    it('case04', () =>{
        let str = "Hello World!";
        
        let aes = new Aes256Cbc();
        let encrypted = aes.encryptoPlainText(str);

        let decrypted = aes.decrypt(encrypted.data, encrypted.length);

        expect(str == decrypted).toBe(true);
    })
})