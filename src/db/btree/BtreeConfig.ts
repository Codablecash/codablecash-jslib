import { ByteBuffer } from "../base_io/ByteBuffer";
import { IBlockObject } from "../filestore_block/IBlockObject";

export class BtreeConfig implements IBlockObject {
    public defaultSize : number;
    public blockSize : number;
    public nodeNumber : number;

    constructor() {
        this.defaultSize = 1024;
        this.blockSize = 64;
        this.nodeNumber = 8;
    }

    public binarySize(): number {
        return 8 + 8 + 8;
    }
    public toBinary(out: ByteBuffer): void {
        out.putLong(this.defaultSize);
        out.putLong(this.blockSize);
        out.putLong(this.nodeNumber);
    }
    public static fromBinary(input : ByteBuffer) {
        let inst = new BtreeConfig();

        inst.defaultSize = Number(input.getLong());
        inst.blockSize = Number(input.getLong());
        inst.nodeNumber = Number(input.getLong());

        return inst;        
    }

    public copyData(): IBlockObject {
        let inst =  new BtreeConfig();

        inst.defaultSize = this.defaultSize;
        inst.blockSize = this.blockSize;
        inst.nodeNumber = this.nodeNumber;

        return inst;
    }
}