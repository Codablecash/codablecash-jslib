import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";

export abstract class AbstractUtxo implements IBlockObject {

    public abstract binarySize(): number;
    public abstract toBinary(out: ByteBuffer): void;
    public abstract copyData(): IBlockObject;

}