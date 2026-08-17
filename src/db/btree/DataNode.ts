import { ByteBuffer } from "../base_io/ByteBuffer";
import { BtreeKeyFactory } from "../btreekey/BtreeKeyFactory";
import { IBlockObject } from "../filestore_block/IBlockObject";
import { AbstractBtreeKey } from "./AbstractBtreeKey";
import { AbstractTreeNode } from "./AbstractTreeNode";

export class DataNode extends AbstractTreeNode {
    private datafpos : number;

    constructor(key? : AbstractBtreeKey | null){
        super((key != undefined && key != null) ? key : null);
        this.datafpos = 0;
    }

    public isData(): boolean {
        return true;
    }
    
    public binarySize(): number {
        let size = 1;

        size += super.binarySize(); // key + fpos
        size += 8; // datafpos

        return size;
    }

    public toBinary(out: ByteBuffer): void {
        out.put(AbstractTreeNode.DATA);

        super.toBinary(out);
        out.putLong(this.datafpos);
    }

    public static fromBinary(input : ByteBuffer, factory : BtreeKeyFactory) : DataNode {
        let node = new DataNode();

        node.fromBinaryAbstract(input, factory);
        node.datafpos = Number(input.getLong());

        return node;
    }

    public getDataFpos() : number {
        return this.datafpos;
    }
    public setDataFpos(fpos : number) : void {
        this.datafpos = fpos;
    }

    public copyData() : IBlockObject {
        let node = new DataNode(this.key);
        node.setFpos(this.fpos);

        node.setDataFpos(this.datafpos);

        return node;
    }
}
