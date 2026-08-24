import { ScPrivateKey } from "../../../base/ecda/ScPrivateKey";
import { BalanceAddress } from "../../../blockchain/bc_base/BalanceAddress";
import { HdWalletSeed } from "../../../blockchain/bc_wallet/HdWalletSeed";
import { BloomFilter1024 } from "../../../blockchain/bc_wallet_filter/BloomFilter1024";
import { ArrayList } from "../../../db/base/ArrayList";

describe('TestBloomFilterGroup', () => {
    it("case01", () => {
        let filter = new BloomFilter1024();
        let list = new ArrayList<BalanceAddress>();

        let maxLoop = 100;
        for(let i = 0; i != maxLoop; ++i){
            let seed = HdWalletSeed.newSeed();;
            let bigInt = seed.toBigInteger();

            let privateKey = new ScPrivateKey(bigInt, 1n);
            let publicKey = privateKey.generatePublicKey();

            let address = BalanceAddress.createAddress(1, publicKey);
            list.addElement(address);
        }

        maxLoop = list.size();
        for(let i = 0; i != maxLoop; ++i){
            let address = list.get(i);

            if(address != null){
                let desc = address.toAddressDescriptor();
                filter.addAddressDesc(desc);
            }
        }

        // check
        for(let i = 0; i != maxLoop; ++i){
            let address = list.get(i);

            if(address != null){
                let bl = filter.checkBytesAddressDesc(address.toAddressDescriptor());
                expect(bl).toBe(true);
            }
        }
    })
})
