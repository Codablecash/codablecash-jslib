import { IComparable } from "../base/IComparable";
import { AbstractTreeNode } from "../btree/AbstractTreeNode";

export class NodecacheRef implements IComparable{
    private count : number;
    private node : AbstractTreeNode;

    constructor(node : AbstractTreeNode){
        this.count = 0;
        this.node = node;
    }

    public getNode() : AbstractTreeNode {
        return this.node;
    }

    compareTo(other: IComparable | null): number {
        let ref = <NodecacheRef>other;

        return this.node.getFpos() - ref.node.getFpos();
    }
}
