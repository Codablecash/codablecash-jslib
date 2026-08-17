import { ByteBuffer } from "../base_io/ByteBuffer";
import { IBlockObject } from "../filestore_block/IBlockObject";


export abstract class AbstractBtreeKey implements IBlockObject {
    constructor() {

    }

    public abstract binarySize(): number;
    public abstract toBinary(out: ByteBuffer): void;

    public abstract isInfinity() : boolean;
    public abstract isNull() : boolean;
    public abstract compareTo() : number;
    public abstract clone() : AbstractBtreeKey;

    public copyData() : IBlockObject {
        return this.clone();
    }
}