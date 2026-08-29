import { CFile } from "../../db/base_io/CFile";
import { AddressDescriptor } from "../bc_base/AddressDescriptor";
import { IWalletDataEncoder } from "../bc_wallet_encoder/IWalletDataEncoder";
import { BloomFilter1024 } from "../bc_wallet_filter/BloomFilter1024";
import { AbstractAddressStore } from "./AbstractAddressStore";


export class ChangeAddressStore extends AbstractAddressStore {
	public static STORE_NAME = "ChangeAddressStore";
	public static KEY_CURRENT_INDEX = "currentIndex";
	public static KEY_NUM_GROUP = "numgroup";

	private currentIndex : number;
	private numAddressInThisGroup : number;

    constructor(zone : number, numAddressInThisGroup : number, baseDir : CFile) {
        super(zone, baseDir, ChangeAddressStore.STORE_NAME);
        this.currentIndex = 0;
        this.numAddressInThisGroup = numAddressInThisGroup;
    }

    public init(encoder : IWalletDataEncoder) {
        this.save();
    }

    public getNextChangeAddress(encoder : IWalletDataEncoder) : AddressDescriptor {
        if(this.currentIndex >= this.numAddressInThisGroup){
            this.currentIndex = 0;
        }

        if(this.currentIndex >= this.addressSerial && this.list.size() < this.numAddressInThisGroup){
            let pair = this.createNewAddressAndPrivateKey(encoder, this.addressSerial++);
            this.list.addElement(pair);
            this.save();
        }
        return this.getAddressDescriptor(this.currentIndex++);
    }

    public save() : void {
        this.__save();

        this.store.addLongValue(ChangeAddressStore.KEY_CURRENT_INDEX, this.currentIndex);
        this.store.addLongValue(ChangeAddressStore.KEY_NUM_GROUP, this.numAddressInThisGroup);
    }

    public load(encoder : IWalletDataEncoder) : void {
        this.store.load();
        this.__load();

        this.currentIndex = Number(this.store.getLongValue(ChangeAddressStore.KEY_CURRENT_INDEX));
        this.numAddressInThisGroup = Number(this.store.getLongValue(ChangeAddressStore.KEY_NUM_GROUP));

        for(let i = 0; i != this.addressSerial; ++i){
            let pair = this.createNewAddressAndPrivateKey(encoder, i);

            this.list.addElement(pair);
        }
    }

    public exportAddress2Filter(filter : BloomFilter1024, encoder : IWalletDataEncoder) {
        let maxLoop = this.numAddressInThisGroup;
        for(let i = 0; i != maxLoop; ++i){
            let desc = this.getNextChangeAddress(encoder);

            filter.addAddressDesc(desc);
        }
    }
}