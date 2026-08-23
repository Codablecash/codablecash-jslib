import { ScPrivateKey } from "../../../base/ecda/ScPrivateKey";
import { BalanceAddress } from "../../../blockchain/bc_base/BalanceAddress";
import { HdWalletSeed } from "../../../blockchain/bc_wallet/HdWalletSeed";
import { ByteBuffer } from "../../../db/base_io/ByteBuffer";

describe('TestAddressDataGroup', () => {
    it('case01', () => {
        let seed = HdWalletSeed.newSeed();
        let bigInt = seed.toBigInteger();

        let privateKey = new ScPrivateKey(bigInt, 1n);
        let publicKey = privateKey.generatePublicKey();

        let address = BalanceAddress.createAddress(1, publicKey);
        
        let capacity = address.binarySize();
        let buff = ByteBuffer.allocateWithEndian(capacity, true);
        address.toBinary(buff);

        buff.position(0);
        let addr = BalanceAddress.createFromBinary(buff);

        // FIXME 
        
        /**
         * 
         * 	BalanceAddress* address2 = dynamic_cast<BalanceAddress*>(addr->copyData()); __STP(address2);

	AddressDescriptor* desc = address->toAddressDescriptor(); __STP(desc);
	AddressDescriptor* desc2 = address2->toAddressDescriptor(); __STP(desc2);

	CHECK(desc->compareTo(desc2) == 0);

	AddressDescriptorData* data = new AddressDescriptorData(desc); __STP(data);
	AddressDescriptorData* data2 = dynamic_cast<AddressDescriptorData*>(data->copyData()); __STP(data2);

	CHECK(desc->compareTo(data2->getDescriptor()) == 0);
         */
    })

})