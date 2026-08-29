import { IMuSigSigner } from "../../base/musig/IMuSigSigner";
import { AddressDescriptor } from "../bc_base/AddressDescriptor";

export interface IMuSigSignerProvidor {
    getSigner(desc : AddressDescriptor) : IMuSigSigner;
}
