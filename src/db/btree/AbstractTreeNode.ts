import { ByteBuffer } from "../base_io/ByteBuffer";
import { BtreeKeyFactory } from "../btreekey/BtreeKeyFactory";
import { IBlockObject } from "../filestore_block/IBlockObject";
import { AbstractBtreeKey } from "./AbstractBtreeKey";
import { DataNode } from "./DataNode";
import { NodeStructureException } from "./NodeStructureException";
import { TreeNode } from "./TreeNode";

export abstract class AbstractTreeNode implements IBlockObject {
	public static readonly NODE : number = 0x01;
	public static readonly DATA : number = 0x02;

    protected key : AbstractBtreeKey | null;
    protected fpos : number;

    constructor(key : AbstractBtreeKey | null) {
        this.key = key;
        this.fpos = 0;      
    }
    
    public abstract copyData(): IBlockObject;

    public abstract isData() : boolean;
    public getKey() : AbstractBtreeKey {
        if(this.key != null){
            return this.key;
        }
        
        throw new Error("null pointer at AbstractTreeNode.getKey()");
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
        if(this.key == null){
            throw new Error("null pointer at AbstractTreeNode.binarySize()");
        }
        
        let size = this.key.binarySize();
        size += 8; // fpos

        return size;
    }
    public toBinary(out : ByteBuffer) : void {
        if(this.key == null){
            throw new Error("null pointer at AbstractTreeNode.toBinary()");
        }

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
