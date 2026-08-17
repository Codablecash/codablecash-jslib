import { ByteBuffer } from "../base_io/ByteBuffer";
import { BtreeKeyFactory } from "../btreekey/BtreeKeyFactory";
import { AbstractBtreeKey } from "./AbstractBtreeKey";
import { DataNode } from "./DataNode";
import { NodeStructureException } from "./NodeStructureException";
import { TreeNode } from "./TreeNode";

export abstract class AbstractTreeNode {
    private key : AbstractBtreeKey;
    private fpos : number;

    constructor(key : AbstractBtreeKey) {
        this.key = key;
        this.fpos = 0;      
    }

    public abstract isData() : boolean;
    public getKey() : AbstractBtreeKey {
        return this.key;
    }
    public setKey(key : AbstractBtreeKey) : void {
        this.key = key.clone();
    }

    public getFpos() : number {
        return this.fpos;
    }
    public setFpos(fpos : number) : void {
        this.fpos = fpos;
    }

    public binarySize() {
        let size = this.key.binarySize();
        size += 8; // fpos

        return size;
    }
    public toBinary(out : ByteBuffer) : void {
        this.key.toBinary(out);
        out.putLong(this.fpos);
    }
    public fromBinaryAbstract(input : ByteBuffer, factory : BtreeKeyFactory) {
        let keytype = input.getInt();
        this.key = factory.fromBinary(keytype, input);

        this.fpos = Number(input.getLong());
    }

    public toDataNode(node : AbstractTreeNode) : DataNode {
        if(!node.isData()){
            throw new NodeStructureException("Cast exception at toDataNode()");
        }
        return <DataNode>node;
    }

    public toTreeNode(node : AbstractTreeNode) : TreeNode{
        if(node.isData()){
            throw new NodeStructureException("Cast exception at toDataNode()");
        }
        return <TreeNode>node;
    }

}
