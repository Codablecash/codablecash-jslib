import { read } from "node:fs";
import { AbstractAddressStore } from "./AbstractAddressStore";
import { CFile } from "../../db/base_io/CFile";
import { IWalletDataEncoder } from "../bc_wallet_encoder/IWalletDataEncoder";
import { BloomFilter1024 } from "../bc_wallet_filter/BloomFilter1024";


export class ReceivingAddressStore extends AbstractAddressStore {
	public static readonly STORE_NAME = "ReceivingAddressStore";
	public static readonly KEY_MAX_ADDRESS = "maxAddress";

    private maxAddress : number;

    constructor(zone : number, maxAddress : number, baseDir : CFile){
        super(zone, baseDir, ReceivingAddressStore.STORE_NAME);
        this.maxAddress = maxAddress;
    }

    public init(encoder : IWalletDataEncoder) : void {
        let maxLoop = this.maxAddress;
        for(let i = 0; i != maxLoop; ++i){
            let pair = this.createNewAddressAndPrivateKey(encoder, this.addressSerial++);

            this.list.addElement(pair);
        }

        this.save();
    }

    public save() : void {
        this.__save();

        this.store.addShortValue(ReceivingAddressStore.KEY_MAX_ADDRESS, this.maxAddress);
    }

    public load(encoder : IWalletDataEncoder) : void {
        this.store.load();
        this.__load();

        this.maxAddress = this.store.getShortValue(ReceivingAddressStore.KEY_MAX_ADDRESS);

        for(let i = 0; i != this.addressSerial; ++i){
            let pair = this.createNewAddressAndPrivateKey(encoder, i);

            this.list.addElement(pair);
        }
    }

    public exportAddress2Filter(filter : BloomFilter1024) : void {
        let maxLoop = this.list.size();
        for(let i = 0; i != maxLoop; ++i){
            let addressKey = this.list.get(i);

            if(addressKey != null){ // guard
                let balanceAddress = addressKey.getAddress();
                filter.addAddressDesc(balanceAddress.toAddressDescriptor());
            }
        }
    }
}