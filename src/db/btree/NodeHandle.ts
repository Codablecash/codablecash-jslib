import { RawArrayPrimitive } from "../base/RawArrayPrimitive";
import { NodecacheRef } from "../btree_cache/NodecacheRef";
import { AbstractBtreeKey } from "./AbstractBtreeKey";
import { AbstractTreeNode } from "./AbstractTreeNode";
import { DataNode } from "./DataNode";
import { TreeNode } from "./TreeNode";

export class NodeHandle {
    private ref : NodecacheRef;

    constructor(ref : NodecacheRef) {
        this.ref = ref;
    }

    public clone() {
        let newInst = new NodeHandle(this.ref);
        return newInst;
    }

    public isRoot() : boolean {
        return AbstractTreeNode.toTreeNode(this.ref.getNode()).isRoot();
    }
    public setIsRoot(isroot : boolean) {
        return AbstractTreeNode.toTreeNode(this.ref.getNode()).setIsRoot(isroot);
    }

    public isData() : boolean {
        return this.ref.getNode().isData();
    }

    public getRef() : NodecacheRef {
        return this.ref;
    }

    public toTreeNode() : TreeNode {
        return AbstractTreeNode.toTreeNode(this.ref.getNode());
    }
    public toDataNode() : DataNode {
        return AbstractTreeNode.toDataNode(this.ref.getNode());
    }

    public getInnerNodeFpos() : RawArrayPrimitive<number> {
        let treeNode = this.toTreeNode();
        return treeNode.getInnerNodeFpos();
    }

    public getKey() : AbstractBtreeKey {
        return this.ref.getNode().getKey();
    }

    public setKey(key : AbstractBtreeKey) : void {
        this.ref.getNode().setKey(key);
    }

    public getFpos() : number {
        return this.ref.getNode().getFpos();
    }
}