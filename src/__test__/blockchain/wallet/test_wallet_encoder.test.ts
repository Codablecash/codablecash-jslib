import { Aes256Cbc } from "../../../base/crypto/Aes256Cbc";
import { HdWalletSeed } from "../../../blockchain/bc_wallet/HdWalletSeed";
import { PasswordEncoder } from "../../../blockchain/bc_wallet_encoder/PasswordEncoder";

describe('TestWalletEncoderGroup', () => {
    it('', () =>{
        let pass = "changeit";
        let seed = HdWalletSeed.newSeed();

        let encoder = new PasswordEncoder(pass);

        let encoded = encoder.encode(seed);
        let decoded = encoder.decode(encoded);

        let bl = seed.equals(decoded);
        expect(bl).toBe(true);
    })
})
