import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { AbstractBtreeDataFactory } from "../../db/btree/AbstractBtreeDataFactory";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";
import { AddressDescriptorData } from "./AddressDescriptorData";

export class AddressDescriptorDataFactory extends AbstractBtreeDataFactory {

    public makeDataFromBinary(input: ByteBuffer): IBlockObject {
        return AddressDescriptorData.fromBinary(input);
    }

    public copy(): AbstractBtreeDataFactory {
        throw new AddressDescriptorDataFactory();
    }
}