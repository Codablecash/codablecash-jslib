import { ArrayList } from "../base/ArrayList";
import { IComparable } from "../base/IComparable";
import { NullPointerException } from "../base/NullPointerException";
import { RawArrayPrimitive } from "../base/RawArrayPrimitive";
import { AbstractBtreeKey } from "./AbstractBtreeKey";
import { BtreeStorage } from "./BtreeStorage";
import { NodeHandle } from "./NodeHandle";
import { NodeStructureException } from "./NodeStructureException";

export class NodePosition implements IComparable{
	private pos : number;
	private node : NodeHandle;
	private innerNodes : ArrayList<NodeHandle>;
	private innerCount : number;

    constructor(nodeHandle : NodeHandle){
        this.node = nodeHandle;
        this.pos = 0;
        this.innerNodes = new ArrayList<NodeHandle>();
        this.innerCount = 0;
    }

   public compareTo(other: IComparable | null): number {
        let o = <NodePosition>other;
        if(o == null){
            return 1;
        }
        return this.pos - o.pos;
    }

    public clearCache() {
        this.innerNodes.reset();
    }

    public isEmpty() : boolean {
        return this.innerCount == 0;
    }

    public getInnerCount() : number {
        return this.innerCount;
    };

    public getKey() : AbstractBtreeKey {
        return this.node.getKey();
    }
    public setKey(key : AbstractBtreeKey) : void {
        this.node.setKey(key);
    }

    public getFpos() : number {
        return this.node.getFpos();
    }

    public isLeaf() : boolean {
        return this.node.isLeaf();
    }

    public isRoot() : boolean {
        return this.node.isRoot();
    }
    public setRoot(isroot : boolean) : void {
        this.node.setIsRoot(isroot);
    }

    public hasKey(key : AbstractBtreeKey) : NodeHandle | null{
        let maxLoop = this.innerNodes.size();
        for(let i = 0; i != maxLoop; ++i){
            let nodeHandle = this.innerNodes.get(i);
            if(nodeHandle == null){
                return null;
            }
            let inkey = nodeHandle.getRef().getNode().getKey();
            if(key.compareTo(inkey) == 0){
                return nodeHandle;
            }
        }

        return null;
    }

    public loadInnerNodes(store : BtreeStorage) {
        this.clearCache();

        let fposList = this.node.getInnerNodeFpos();
        this.innerNodes = new ArrayList<NodeHandle>(fposList.size());

        this.innerCount = 0;

        let maxLoop = fposList.size();
        for(let i = 0; i != maxLoop; ++i){
            let fpos = fposList.get(i);
            if(fpos == 0){
                this.innerNodes.addElement(null);
                continue;
            }

            let nodeHandle = store.loadNode(fpos);
            
            //assert(nodeHandle.getFpos() != 0);

            this.innerNodes.addElement(nodeHandle);
            this.innerCount++;
        }
    }

    public setLastPos() : void {
        this.pos = this.innerCount - 1;
    }

    public isFull(nodeNumber : number) : boolean {
        return this.innerCount >= nodeNumber;
    }

    public addNode(key : AbstractBtreeKey, fpos : number, nodeNumber : number) {
        for(let i = 0; i != nodeNumber; ++i){
            let nh = this.innerNodes.get(i);

            if(nh == null || nh.getKey().compareTo(key) > 0){
                this.internalAddNode(i, fpos);
                break;
            }
        }
        this.clearCache();
    }

    public getNextChildPrevious(key : AbstractBtreeKey) : number {
        let ret = 0;
        let maxLoop = this.innerCount;
        for(let i = maxLoop - 1; i >= 0; --i){
            let nh = this.innerNodes.get(i);

            if(nh != null && key.compareTo(nh.getKey()) == 0){
                ret = nh.getFpos();
                this.pos = i - 1;
                break;
            }
            else if(nh != null && key.compareTo(nh.getKey()) > 0){
                nh = this.innerNodes.get(i + 1);

                if(nh != null){ // guard
                    ret = nh.getFpos();
                    this.pos = i;
                    break;
                }

            }
        }

        if(ret == 0){
            let nh = this.innerNodes.get(0);

            if(nh != null){ // guard
                ret = nh.getFpos();
                this.pos = -1;
            }
        }

        return ret;
    }

    public getNextChild(key : AbstractBtreeKey) : number {
        let ret = 0;
        let maxLoop = this.innerCount;
        for(let i = 0; i != maxLoop; ++i){
            let nh = this.innerNodes.get(i);
            this.pos++;

            if(nh != null){
                let hskey = nh.getKey();
                if(key.compareTo(hskey) <= 0){
                    ret = nh.getFpos();
                    break;
                }
            }
        }

        return ret;
    }

    public getInnerNodes() : ArrayList<NodeHandle> {
        return this.innerNodes;
    }

    public internalAddNode(index : number, fpos : number) : void {
        let treeNode = this.node.toTreeNode();
        let list = treeNode.getInnerNodeFpos();

        let first = list.size() - 1;
        for(let i = first; i > index; --i){
            let f = list.get(i - 1);
            list.set(i ,f);
        }
        list.set(index ,fpos);

        this.innerCount++;
    }

    public updateInnerNodeFpos(newlist : RawArrayPrimitive<number>) {
        let treeNode = this.node.toTreeNode();
        treeNode.updateInnerNodeFpos(newlist);

        this.clearCache();
    }

    public save(store : BtreeStorage) : void {
        let node = this.node.getRef().getNode();

        store.updateNode(node);
    }

    public getNodeHandle() : NodeHandle {
        return this.node;
    }

    public getChildFpos(i : number) : number {
        let node = this.innerNodes.get(i);
        if(node != null){
            return node.getFpos();
        }

        throw new NullPointerException("NodePosition.getChildFpos()");
    }

    public previousData() : number {
        let dnode = this.node.toDataNode();

        //if(0 < this.pos){
        //	return 0;
        //}
        //assert(this.pos == 0);

        this.pos--;
        return dnode.getDataFpos();
    }

   public previousNode() : number {
        let treeNode = this.node.toTreeNode();
        let list = treeNode.getInnerNodeFpos();

        if(this.pos < 0){
            return 0;
        }

        let cur = this.pos--;
        return list.get(cur);
    }

    public hasPrevious() : boolean {
        return this.pos >= 0;
    }

    public nextData() : number {
        let dnode = this.node.toDataNode();

        //if(0 < this.pos){
        //	return 0;
        //}
        //assert(this.pos == 0);

        this.pos++;
        return dnode.getDataFpos();
    }

    public nextNode() : number {
        let treeNode = this.node.toTreeNode();
        let list = treeNode.getInnerNodeFpos();

        if(this.innerCount - 1 < this.pos){
            return 0;
        }

        let cur = this.pos++;
        return list.get(cur);
    }

    public hasNext() : boolean {
        return this.innerCount > this.pos;
    }

    public removeChildNode(key : AbstractBtreeKey, store : BtreeStorage) : boolean {
        let removePos = this.indexof(key);
        if(removePos < 0){
            return false;
        }

        if(this.isLeaf()){
            this.internalRemoveLeafChildNode(removePos, store, key);
        }
        else{
            this.internalRemoveChildNode(removePos, store);
        }

        return true;
    }

    public removeInnerNodeFpos(index : number) : void {
        let dnodesList = this.node.getInnerNodeFpos();
        let maxLoop = this.innerCount - 1;
        let i = index;
        for(; i != maxLoop; i++){
            let nextfpos = dnodesList.get(i + 1);
            dnodesList.set(i, nextfpos);
        }

        dnodesList.set(i, 0);
    }

    /**
     * remove node (not data node)
     */
    public internalRemoveChildNode(index : number, store : BtreeStorage) : void {
        let nh = this.innerNodes.get(index);

        if(nh != null){
            let fpos = nh.getFpos();

            this.removeInnerNodeFpos(index); // remove fpos
            this.innerNodes.remove(index); // remove cached
            this.innerCount--;
            this.save(store);

            store.remove(fpos);
        }
    }

    /**
     * remove data node
     */
    public internalRemoveLeafChildNode(index : number, store : BtreeStorage, key : AbstractBtreeKey) : void {
        let dfactory = store.getDataFactory();

        // delete cache use count
        let nh = this.innerNodes.get(index);

        if(nh != null){
            let dnode = nh.toDataNode();

            let remove = dfactory.beforeRemove(dnode, store, key);
            if(!remove){
                return;
            }

            let dataFpos = dnode.getDataFpos();

            // remove data
            this.innerNodes.remove(index);


            store.removeData(dataFpos);

            // remove child data node
            let nodeFpos = dnode.getFpos();
            store.remove(nodeFpos);

            // update self
            this.removeInnerNodeFpos(index);
            this.innerCount--;

            store.updateNode(this.node.getRef().getNode());
        }
    }

    public indexof(key : AbstractBtreeKey) : number {
        let maxLoop = this.innerCount;
        for(let i = 0; i != maxLoop; ++i){
            let nh = this.innerNodes.get(i);

            if(nh != null && key.compareTo(nh.getKey()) == 0){
                return i;
            }
        }

        return -1;
    }

    public gotoEqLessThanKey(key : AbstractBtreeKey) : NodeHandle | null {
        let maxLoop = this.innerCount;

        for(let i = maxLoop - 1; i >= 0; --i){
            let nh = this.innerNodes.get(i);
            if(nh != null && key.compareTo(nh.getKey()) >= 0){
                this.pos = i - 1;
                return nh;
            }
        }

        return null;
    }


    public gotoEqMoreThanKey(key : AbstractBtreeKey) : NodeHandle | null {
        let maxLoop = this.innerCount;

        for(let i = 0; i != maxLoop; ++i){
            this.pos++;
            let nh = this.innerNodes.get(i);
            if(nh != null && key.compareTo(nh.getKey()) <= 0){
                return nh;
            }
        }

        return null;
    }

    public gotoEqKey(key : AbstractBtreeKey) : NodeHandle | null{
        let maxLoop = this.innerCount;

        for(let i = 0; i != maxLoop; ++i){
            this.pos++;
            let nh = this.innerNodes.get(i);
            if(nh != null && key.compareTo(nh.getKey()) == 0){
                return nh;
            }
        }

        return null;
    }
}
