import { ScPrivateKey } from "../../../base/ecda/ScPrivateKey";
import { HdWalletSeed } from "../../../blockchain/bc_wallet/HdWalletSeed";

describe('TestAddressDataGroup', () => {
    it('case01', () => {
        let seed = HdWalletSeed.newSeed();
        let bigInt = seed.toBigInteger();

        let privateKey = new ScPrivateKey(bigInt, 1n);
        let publicKey = privateKey.generatePublicKey();

        
    })

})