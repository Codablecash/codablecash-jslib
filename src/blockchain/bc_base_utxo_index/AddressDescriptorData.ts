import { AddressDescriptor } from "../bc_base/AddressDescriptor";

export class AddressDescriptorData {
    private desc : AddressDescriptor;

    constructor(desc : AddressDescriptor){
        this.desc = <AddressDescriptor>desc.copyData();
    }
}
