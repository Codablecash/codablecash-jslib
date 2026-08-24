import { ArrayList } from "../../db/base/ArrayList";
import { CFile } from "../../db/base_io/CFile";
import { AddressAndPrivateKey } from "./AddressAndPrivateKey";
import { HdWalletSeed } from "./HdWalletSeed";

export class AbstractAddressStore {
    protected zone : number;
    protected encryptedSeed : HdWalletSeed | null;
    protected addressSerial : number;

    protected list : ArrayList<AddressAndPrivateKey>;

    constructor(zone : number, baseDir : CFile, storeName : string){
        this.encryptedSeed = null;
        this.addressSerial = 0;
        this.zone = zone; 

        this.list = new ArrayList<AddressAndPrivateKey>();
    }
}