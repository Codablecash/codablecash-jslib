import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { SoftwareVersion } from "../bc/SoftwareVersion";

export class BlockVersion extends SoftwareVersion {
    constructor(major : number, minor : number, patch : number) {
        super(major, minor, patch);
    }

    public static createFromBinary(input : ByteBuffer) : BlockVersion {
        let major = input.get();
        let minor = input.get();
        let pathch = input.get();

        return new BlockVersion(major, minor, pathch);
    }

    public clone() : BlockVersion{
        return new BlockVersion(this.major, this.minor, this.patch);
    }
}
