import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { SoftwareVersion } from "../bc/SoftwareVersion";

export class TransactionVersion extends SoftwareVersion {
    public static createFromBinary(input : ByteBuffer) : TransactionVersion {
        let major = input.get();
        let minor = input.get();
        let pathch = input.get();

        return new TransactionVersion(major, minor, pathch);
    }
}