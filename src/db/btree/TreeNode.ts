import { RawArrayPrimitive } from "../base/RawArrayPrimitive";
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

    

}

