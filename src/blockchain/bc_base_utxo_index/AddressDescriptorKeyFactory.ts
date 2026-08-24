import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { AbstractBtreeKey } from "../../db/btree/AbstractBtreeKey";
import { BtreeKeyFactory } from "../../db/btreekey/BtreeKeyFactory";
import { AddressDescriptorKey } from "./AddressDescriptorKey";

export class AddressDescriptorKeyFactory extends BtreeKeyFactory {
    public static readonly ADDRESS_DESC_KEY = 0x14;

    constructor() {
        super();
    }

	public fromBinary(keyType : number, input : ByteBuffer) : AbstractBtreeKey {
        if(keyType == AddressDescriptorKeyFactory.ADDRESS_DESC_KEY){
            return AddressDescriptorKey.fromBinary(input);
        }

        return super.fromBinary(keyType, input);
    }

	public copy() : BtreeKeyFactory {
        return new AddressDescriptorKeyFactory();
    }
}