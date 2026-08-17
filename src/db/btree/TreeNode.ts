import { RawArrayPrimitive } from "../base/RawArrayPrimitive";
import { IBlockObject } from "../filestore_block/IBlockObject";
import { AbstractBtreeKey } from "./AbstractBtreeKey";
import { AbstractTreeNode } from "./AbstractTreeNode";



export class TreeNode extends AbstractTreeNode {

    private root : boolean;
    private leaf : boolean;
    private children : RawArrayPrimitive<number>;

    constructor(numChildren? : number, key? : AbstractBtreeKey, leaf? : boolean){
        super((key != undefined && key != null) ? key : null);

        if(numChildren != undefined && key != undefined && leaf != undefined){
            this.root = false;
            this.leaf = leaf;
            this.children = new RawArrayPrimitive<number>(); 
            return;
        }       

        this.root = false;
        this.leaf = false;
        this.children = new RawArrayPrimitive<number>();
    }
    
    public isData(): boolean {
        return false;
    }

    public copyData(): IBlockObject {
        throw new Error("Method not implemented.");
    }

}

