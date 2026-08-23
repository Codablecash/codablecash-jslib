import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";
import { AddressDescriptor } from "../bc_base/AddressDescriptor";

export class AddressDescriptorData implements IBlockObject {
    private desc : AddressDescriptor;

    constructor(desc : AddressDescriptor){
        this.desc = <AddressDescriptor>desc.copyData();
    }

    public binarySize(): number {
        let total = this.desc.binarySize();

        return total;
    }
    public toBinary(out: ByteBuffer): void {
        this.desc.toBinary(out);
    }
    public fromBinary(input : ByteBuffer) {
        let desc = AddressDescriptor.createFromBinary(input);
        return new AddressDescriptorData(desc);
    }

    public copyData(): IBlockObject {
        let inst = new AddressDescriptorData(this.desc);
        return inst;
    }
}
