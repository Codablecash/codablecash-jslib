import { AddressDescriptor } from "../bc_base/AddressDescriptor";

export interface IAddressChecker {
    checkAddress(desc : AddressDescriptor) : boolean;
}