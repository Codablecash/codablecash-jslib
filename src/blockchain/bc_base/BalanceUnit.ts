import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";

export class BalanceUnit implements IBlockObject {
    binarySize(): number {
        throw new Error("Method not implemented.");
    }
    toBinary(out: ByteBuffer): void {
        throw new Error("Method not implemented.");
    }
    copyData(): IBlockObject {
        throw new Error("Method not implemented.");
    }

}