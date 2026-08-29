import { ScPrivateKey } from "../../base/ecda/ScPrivateKey";
import { ScPublicKey } from "../../base/ecda/ScPublicKey";
import { IMuSigSigner } from "../../base/musig/IMuSigSigner";
import { SimpleMuSigSigner } from "../../base/musig/SimpleMuSigSigner";
import { ArrayList } from "../../db/base/ArrayList";
import { NullPointerException } from "../../db/base/NullPointerException";
import { CFile } from "../../db/base_io/CFile";
import { AddressDescriptor } from "../bc_base/AddressDescriptor";
import { BalanceAddress } from "../bc_base/BalanceAddress";
import { StatusStore } from "../bc_base_conf_store/StatusStore";
import { IWalletDataEncoder } from "../bc_wallet_encoder/IWalletDataEncoder";
import { AddressAndPrivateKey } from "./AddressAndPrivateKey";
import { HdWalletSeed } from "./HdWalletSeed";

export class AbstractAddressStore {
	public static KEY_ZONE = "zone";
	public static KEY_ENCRYPTED_SEED = "encryptedSeed";
	public static KEY_ADDRESS_SERIAL = "adressSerial";

    protected zone : number;
    protected encryptedSeed : HdWalletSeed | null;
    protected addressSerial : number;

    protected list : ArrayList<AddressAndPrivateKey>;
    protected store : StatusStore;

    constructor(zone : number, baseDir : CFile, storeName : string){
        this.encryptedSeed = null;
        this.addressSerial = 0;
        this.zone = zone; 

        this.list = new ArrayList<AddressAndPrivateKey>();
        this.store = new StatusStore(baseDir, storeName);
    }

	public size() : number {
		return this.list.size();
	}

    public setEncryptedSeed(encrypted : HdWalletSeed) : void {
        this.encryptedSeed = encrypted;
    }

    public getAddressDescriptor(i : number) : AddressDescriptor {
        let address = this.getAddress(i);

        return address.toAddressDescriptor();
    }

    public getAddress(i : number | AddressDescriptor) : BalanceAddress {
        if(typeof i != "number"){
            let ret = this.__getAddress(i);

            if(ret != null){
                return ret;
            }
            throw new NullPointerException("AbstractAddressStore.__getAddress()");
        }

        let pkey = this.list.get(i);

        if(pkey != null){
            let address = pkey.getAddress();

            return address;
        }
        throw new NullPointerException("AbstractAddressStore.getAddress()");
    }

    protected __getAddress(desc : AddressDescriptor) : BalanceAddress | null {
        let ret = null;

        let maxLoop = this.list.size();
        for(let i = 0; i != maxLoop; ++i){
            let addr = this.getAddress(i);
            let d = addr.toAddressDescriptor();
            if(d.compareTo(desc) == 0){
                ret = addr;
                break;
            }
        }
        return ret;
    }

    public hasAddress(desc : AddressDescriptor) : boolean {
        return this.__getAddress(desc) != null;
    }

    public createNewAddressAndPrivateKey(encoder : IWalletDataEncoder, serial : number) : AddressAndPrivateKey {
        if(this.encryptedSeed != null){
            let seed = encoder.decode(this.encryptedSeed);

            let bigInt = seed.toBigInteger();
            let privateKey = new ScPrivateKey(bigInt, BigInt(serial + 1));

            let publicKey = privateKey.generatePublicKey();

            let ret = new AddressAndPrivateKey();
            ret.setPrivateKey(privateKey);

            let address = BalanceAddress.createAddress(this.zone, publicKey);
            ret.setBalanceAddress(address);

            return ret;
        }
        throw new NullPointerException("AbstractAddressStore.createNewAddressAndPrivateKey()");
    }

    public getSigner(desc : AddressDescriptor, encoder : IWalletDataEncoder) : IMuSigSigner {
        let ret = null;

        let maxLoop = this.list.size();
        for(let i = 0; i != maxLoop; ++i){
            let key = this.list.get(i);

            if(key != null){
                let address = key.getAddress();
                let descriptor = address.toAddressDescriptor();
                if(desc.compareTo(descriptor) == 0){
                    let pkey = key.getPrivateKey();
                    ret = new SimpleMuSigSigner(pkey.getKeyvalue());
                    break;
                }
            }
        }

        if(ret != null){
            return ret;
        }
        throw new NullPointerException("AbstractAddressStore.getSigner()");
    }

    protected __save() {
        this.store.addShortValue(AbstractAddressStore.KEY_ZONE, this.zone);

         if(this.encryptedSeed != null){
            let buff = this.encryptedSeed.getByteBuffer();
            this.store.addBinaryValue(AbstractAddressStore.KEY_ENCRYPTED_SEED, buff.toUint8Array(), buff.limit());
        }

        this.store.addLongValue(AbstractAddressStore.KEY_ADDRESS_SERIAL, this.addressSerial);
    }

    protected __load() {
        this.zone = this.store.getShortValue(AbstractAddressStore.KEY_ZONE);

        {
            let buff = this.store.getBinaryValue(AbstractAddressStore.KEY_ENCRYPTED_SEED);
            this.encryptedSeed = new HdWalletSeed(buff.toUint8Array(), buff.limit());
        }

        this.addressSerial = Number(this.store.getLongValue(AbstractAddressStore.KEY_ADDRESS_SERIAL));
    }
}