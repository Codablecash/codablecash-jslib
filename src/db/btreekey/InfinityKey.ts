import { ByteBuffer } from "../base_io/ByteBuffer";
import { AbstractBtreeKey } from "../btree/AbstractBtreeKey";


export class InfinityKey extends AbstractBtreeKey {


    public binarySize(): number {
        throw new Error("Method not implemented.");
    }
    public toBinary(out: ByteBuffer): void {
        throw new Error("Method not implemented.");
    }
    public isInfinity(): boolean {
        throw new Error("Method not implemented.");
    }
    public isNull(): boolean {
        throw new Error("Method not implemented.");
    }
    public compareTo(key : AbstractBtreeKey): number {
        throw new Error("Method not implemented.");
    }
    public clone(): AbstractBtreeKey {
        throw new Error("Method not implemented.");
    }

}