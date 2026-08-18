import { RawArrayPrimitive } from "../base/RawArrayPrimitive";
import { ByteBuffer } from "../base_io/ByteBuffer";
import { BtreeKeyFactory } from "../btreekey/BtreeKeyFactory";
import { IBlockObject } from "../filestore_block/IBlockObject";
import { AbstractBtreeKey } from "./AbstractBtreeKey";
import { AbstractTreeNode } from "./AbstractTreeNode";



export class TreeNode extends AbstractTreeNode {

    private root : boolean;
    private leaf : boolean;
    private children : RawArrayPrimitive<number>;

    constructor(isroot : boolean, numChildren? : number, key? : AbstractBtreeKey, leaf? : boolean){
        super((key != undefined && key != null) ? key : null);

        if(numChildren != undefined && key != undefined && leaf != undefined){
            this.root = isroot;
            this.leaf = leaf;
            this.children = new RawArrayPrimitive<number>(); 
            return;
        }       

        this.root = isroot;
        this.leaf = false;
        this.children = new RawArrayPrimitive<number>();
    }
    
    public isData(): boolean {
        return false;
    }

    public copyData(): IBlockObject {
        throw new Error("Method not implemented.");
    }

    public isRoot() {
        return this.root;
    }
    public setIsRoot(isroot : boolean) {
        this.root = isroot;
    }

    public isLeaf() {
        return this.leaf;
    }

    public binarySize(): number {
        let size = 1; // nodetype

        size += super.binarySize(); // key + fpos...

        size += 1*2; // isRoot + isLeaf

        size += 4; // number of children
        size += 8 * this.children.size();

        return size;
    }
    
    public toBinary(out: ByteBuffer): void {
        out.put(AbstractTreeNode.NODE); // nodetype

        super.toBinary(out); // key + fpos...

        out.put(this.root ? 1 : 0);
        out.put(this.leaf ? 1 : 0);

        let maxLoop = this.children.size();
        out.putInt(maxLoop);

        for(let i = 0; i != maxLoop; ++i){
            let nodefpos = this.children.get(i);
            out.putLong(nodefpos);
        }
    }

    public static fromBinary(input : ByteBuffer, factory : BtreeKeyFactory) {
        let node = new TreeNode(false);

        node.fromBinaryAbstract(input, factory);

        node.root = (input.get() == 1);
        node.leaf = (input.get() == 1);

        let maxLoop = input.getInt();
        node.children = new RawArrayPrimitive<number>(maxLoop);

        let i = 0;
        for(; i != maxLoop; ++i){
            let nodefpos : number = Number(input.getLong());
            node.children.addElement(nodefpos);
        }

        return node;
    }


}

