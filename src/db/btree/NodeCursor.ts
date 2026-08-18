import { ArrayList } from "../base/ArrayList";
import { NullPointerException } from "../base/NullPointerException";
import { RawArrayPrimitive } from "../base/RawArrayPrimitive";
import { InfinityKey } from "../btreekey/InfinityKey";
import { IBlockObject } from "../filestore_block/IBlockObject";
import { AbstractBtreeKey } from "./AbstractBtreeKey";
import { AbstractTreeNode } from "./AbstractTreeNode";
import { BtreeStorage } from "./BtreeStorage";
import { DataNode } from "./DataNode";
import { NodeHandle } from "./NodeHandle";
import { NodePosition } from "./NodePosition";
import { TreeNode } from "./TreeNode";

export class NodeCursor {
	private nodestack : ArrayList<NodePosition>;
	private nodeNumber : number; // max inner nodes number in a node
	private store : BtreeStorage;

    constructor(rootNode : NodeHandle, store : BtreeStorage, nodeNumber : number) {
        this.nodestack = new ArrayList<NodePosition>();
        let npos = new NodePosition(rootNode);
        this.push(npos);

        this.store = store;
        this.nodeNumber = nodeNumber;
    }

    public pop() : NodePosition {
        let index = this.nodestack.size() - 1;
        let node = this.nodestack.get(index);

        this.nodestack.remove(index);

        if(node != null){
            return node;
        }
        throw new NullPointerException("NodeCursor.pop()");
    }

    public push(node : NodePosition) : void {
        this.nodestack.addElement(node);
    }

    public top() : NodePosition {
        let index = this.nodestack.size() - 1;
        
        let n = this.nodestack.get(index);
        if(n != null){
            return n;
        }
        throw new NullPointerException("NodePosition.top()");
    }

    public insert(key : AbstractBtreeKey, data : IBlockObject) : void {
        let current = this.top();
        //__ASSERT_TREE

        // check data nodes
        current.loadInnerNodes(this.store);

        // down to leaf node
        while(!current.isLeaf()){
            let nextFpos = current.getNextChild(key);
            let nh = this.store.loadNode(nextFpos);

            current = new NodePosition(nh);
            this.push(current);

            current.loadInnerNodes(this.store);
        }

        // 1. already has key
        let sameKeyDataNode = current.hasKey(key);
        if(sameKeyDataNode != null){
            let dnode = sameKeyDataNode.toDataNode();

            let dfactory = this.store.getDataFactory();
            dfactory.registerData(key, data, dnode, this.store);

            this.store.updateNode(dnode);

            return;
        }

        // 2. Add key, then check whether the node is full or not
        if(current.isFull(this.nodeNumber)){
            this.splitLeafNode(key, data);

            return;
        }

        // simply add data
        let dataNode = new DataNode(key.clone());

        let dfactory = this.store.getDataFactory();
        dfactory.registerData(key, data, dataNode, this.store);

        let newDataNodeFpos = this.store.storeNode(dataNode);

        current.addNode(key, newDataNodeFpos, this.nodeNumber);
        current.save(this.store);

        current.loadInnerNodes(this.store);
    }

    public splitLeafNode(key : AbstractBtreeKey, data : IBlockObject) : void {
        let current = this.top();

        // data node
        let dataNode = new DataNode(key.clone());

        let dfactory = this.store.getDataFactory();
        dfactory.registerData(key, data, dataNode, this.store);

        this.store.storeNode(dataNode);

        // split
        let list = current.getInnerNodes();

        let list1 = new RawArrayPrimitive<number>(this.nodeNumber);
        let list2 = new RawArrayPrimitive<number>(this.nodeNumber);

        let newKey = this.setupTwoLists(list, dataNode, list1, list2);

        // new Node
        let newNode = new TreeNode(false, this.nodeNumber, newKey.clone(), true);
        newNode.updateInnerNodeFpos(list1);
        this.store.storeNode(newNode);

        // update current
        let isroot = current.isRoot();
        current.setRoot(false);
        current.updateInnerNodeFpos(list2);
        current.save(this.store);

        // add to parent node
        if(isroot){
            this.createNewRoot(newNode);
        }
        else{
            this.addToParent(newNode);
        }
    }

    public createNewRoot(newNode : TreeNode) : void {
        let current = this.pop();

        let rootNode = new TreeNode(true, this.nodeNumber, new InfinityKey(), false);
        let nodes = rootNode.getInnerNodeFpos();
        nodes.set(0, newNode.getFpos());
        nodes.set(1, current.getFpos());

        this.store.storeNode(rootNode);

        this.store.updateRootFpos(rootNode.getFpos());
    }

    public addToParent(newNode : TreeNode) : void {
        this.pop();

        let current = this.top();

        if(current.isFull(this.nodeNumber)){
            this.splitTreeNode(newNode);
        }
        else{
            current.addNode(newNode.getKey(), newNode.getFpos(), this.nodeNumber);
            current.save(this.store);

            // reload
            current.loadInnerNodes(this.store);
        }
    }

    public splitTreeNode(node : TreeNode) : void {
        let current = this.top();

        // split
        let list = current.getInnerNodes();

        let list1 = new RawArrayPrimitive<number>(this.nodeNumber);
        let list2 = new RawArrayPrimitive<number>(this.nodeNumber);

        let newKey = this.setupTwoLists(list, node, list1, list2);

        // new Node
        let newNode = new TreeNode(false, this.nodeNumber, newKey.clone(), false);
        newNode.updateInnerNodeFpos(list1);
        this.store.storeNode(newNode);

        // update current
        let isroot = current.isRoot();
        current.setRoot(false);
        current.updateInnerNodeFpos(list2);
        current.save(this.store);

        // add to parent node
        if(isroot){
            this.createNewRoot(newNode);
        }
        else{
            this.addToParent(newNode);
        }
    }

    public setupTwoLists(list : ArrayList<NodeHandle>, node : AbstractTreeNode,
                                    list1 : RawArrayPrimitive<number>, list2 : RawArrayPrimitive<number>) : AbstractBtreeKey {
        let allList = new ArrayList<AbstractTreeNode>(list.size() + 1);

        let key = node.getKey();
        let done = false;
        let maxLoop = list.size();
        for(let i = 0; i != maxLoop; ++i){
            let nh = list.get(i);
            //assert(nh != nullptr);

            if(nh != null && !done){
                let nhKey = nh.getKey();
                if(nhKey.compareTo(key) > 0){
                    done = true;
                    allList.addElement(node);
                }
            }

            if(nh != null){ // guard
                let nhnode = nh.getRef().getNode();
                allList.addElement(nhnode);
            }
        }

        if(!done){
            allList.addElement(node);
        }

        let total = allList.size();
        let list1Size = total / 2;

        let i = 0;
        for(; i != list1Size; ++i){
            let n = allList.get(i);
            if(n != null){
                list1.addElement(n.getFpos());
            }
        }
        for(; i != total; ++i){
            let n = allList.get(i);
            if(n != null){
                list2.addElement(n.getFpos());
            }
        }

        let n = allList.get(list1Size - 1);
        if(n != null){
            return n.getKey().clone();
        }
        //return allList.get(list1Size - 1).getKey().clone();
        throw new NullPointerException("NodeCursor.setupTwoLists()");
    }

    public gotoKey(key : AbstractBtreeKey) : IBlockObject | null{
        this.gotoLeaf(key);

        let current = this.top();

        let nh = current.gotoEqMoreThanKey(key);
        if(nh == null){
            return null;
        }

        let nodePos = new NodePosition(nh.clone());
        this.push(nodePos);

        let dataFpos = nodePos.nextData();
        let obj = this.store.loadData(dataFpos);

        return obj;
    }

    public gotoLeaf(key : AbstractBtreeKey) : NodePosition {
        let current = this.top();

        // check data nodes
        current.loadInnerNodes(this.store);

        while(!current.isLeaf()){
            let nextFpos = current.getNextChild(key);
            let nh = this.store.loadNode(nextFpos);

            current = new NodePosition(nh);
            this.push(current);

            current.loadInnerNodes(this.store);
        }

        return current;
    }

    public gotoLast() : IBlockObject | null {
        let current = this.top();

        // check data nodes
        current.loadInnerNodes(this.store);
        current.setLastPos();

        while(!current.isLeaf()){
            let nextFpos = current.previousNode();
            let nh = this.store.loadNode(nextFpos);

            current = new NodePosition(nh);
            this.push(current);
            current.loadInnerNodes(this.store);
            current.setLastPos();
        }

        let nextFpos = current.previousNode();
        if(nextFpos == 0){
            return null;
        }

        let nh = this.store.loadNode(nextFpos);
        current = new NodePosition(nh);
        this.push(current);

        //checkIsDataNode(current.getNodeHandle(), __FILE__, __LINE__);

        let datafpos = current.previousData();

        return this.store.loadData(datafpos);
    }

    public getPrevious() : IBlockObject | null {
        let current = this.top();

        // get data from current node;
        let cnh = current.getNodeHandle();
        if(!cnh.isData() && cnh.isRoot()){
            return null;
        }

        // checkIsDataNode(cnh, __FILE__, __LINE__);
        //uint64_t dfpos = current.nextData();

        //if(dfpos != 0){
        //	return this.store.loadData(dfpos);
        //}

        // pop data node
        this.pop();

        current = this.top();
        while(!current.isLeaf() || !current.hasPrevious()){
            let nextfpos = current.previousNode();

            if(nextfpos == 0){
                if(current.isRoot()){
                    return null;
                }
                this.pop();
                current = this.top();
            }
            else{
                let nh = this.store.loadNode(nextfpos);
                current = new NodePosition(nh);
                this.push(current);

                current.loadInnerNodes(this.store);
                current.setLastPos();
            }
        }

        // current is leaf having next data
        let nextfpos = current.previousNode();
        let nh = this.store.loadNode(nextfpos);
        current = new NodePosition(nh);
        this.push(current);

        // checkIsDataNode(current.getNodeHandle(), __FILE__, __LINE__);

        let datafpos = current.previousData();

        return this.store.loadData(datafpos);
    }

    public gotoKeyPrevious(key : AbstractBtreeKey) : IBlockObject | null {
        this.gotoLeafPrevious(key);

        let current = this.top();

        let nh = current.gotoEqLessThanKey(key);
        if(nh == null){
            return null;
        }

        let nodePos = new NodePosition(nh.clone());
        this.push(nodePos);

        let dataFpos = nodePos.previousData();
        let obj = this.store.loadData(dataFpos);

        return obj;
    }

    public gotoLeafPrevious(key : AbstractBtreeKey) : NodePosition {
        let current = this.top();

        // check data nodes
        current.loadInnerNodes(this.store);
        current.setLastPos();

        while(!current.isLeaf()){
            let nextFpos = current.getNextChildPrevious(key);
            let nh = this.store.loadNode(nextFpos);

            current = new NodePosition(nh);
            this.push(current);

            current.loadInnerNodes(this.store);
            current.setLastPos();
        }

        return current;
    }

    public gotoFirst() : IBlockObject | null {
        let current = this.top();

        // check data nodes
        current.loadInnerNodes(this.store);

        while(!current.isLeaf()){
        //	uint64_t nextFpos = current.getInnerNodes().get(0).getFpos();
            let nextFpos = current.nextNode();
            let nh = this.store.loadNode(nextFpos);

            current = new NodePosition(nh);
            this.push(current);

            current.loadInnerNodes(this.store);
        }

        let nextFpos = current.nextNode();
        if(nextFpos == 0){
            return null;
        }

        let nh = this.store.loadNode(nextFpos);
        current = new NodePosition(nh);
        this.push(current);

        // checkIsDataNode(current.getNodeHandle(), __FILE__, __LINE__);

        let datafpos = current.nextData();

        return this.store.loadData(datafpos);
    }

    public getNext() : IBlockObject | null {
        let current = this.top();

        // get data from current node;
        let cnh = current.getNodeHandle();
        if(!cnh.isData() && cnh.isRoot()){
            return null;
        }

        //checkIsDataNode(cnh, __FILE__, __LINE__);
        //uint64_t dfpos = current.nextData();

        //if(dfpos != 0){
        //	return this.store.loadData(dfpos);
        //}

        // pop data node
        this.pop();

        current = this.top();
        while(!current.isLeaf() || !current.hasNext()){
            let nextfpos = current.nextNode();

            if(nextfpos == 0){
                if(current.isRoot()){
                    return null;
                }
                this.pop();
                current = this.top();
            }
            else{
                let nh = this.store.loadNode(nextfpos);
                current = new NodePosition(nh);
                this.push(current);

                current.loadInnerNodes(this.store);
            }
        }

        // current is leaf having next data
        let nextfpos = current.nextNode();
        let nh = this.store.loadNode(nextfpos);
        current = new NodePosition(nh);
        this.push(current);

        //checkIsDataNode(current.getNodeHandle(), __FILE__, __LINE__);

        let datafpos = current.nextData();

        return this.store.loadData(datafpos);
    }

    public getCurrentKey() : AbstractBtreeKey {
        let current = this.top();
        return current.getKey();
    }

    public find(key : AbstractBtreeKey) : IBlockObject | null{
        if(this.store != null){
            let leafNode = this.gotoLeaf(key);

            let nh = leafNode.gotoEqKey(key);
            if(nh == null){
                return null;
            }

            let dataNode = nh.toDataNode();

            let dataFpos = dataNode.getDataFpos();

            return this.store.loadData(dataFpos);
        }
        throw new NullPointerException("NodeCursor.find()");
    }

    public remove(key : AbstractBtreeKey) : boolean {
        let leafNode = this.gotoLeaf(key);
        // assert(leafNode.isLeaf());

        let removed = leafNode.removeChildNode(key, this.store);
        if(!removed){
            return false;
        }

        this.internalRemoveFromBottomToUpper();
        this.internalRemoveRoot();
        this.store.sync(false);

        // __ASSERT_TREE

        return true;
    }

    /**
     * root node has an only 1 child
     */
    private internalRemoveRoot() : void {
        let current = this.pop();
        while(!current.isRoot()){
            current = this.pop();
        }

        this.push(current);

        while(current.getInnerCount() == 1 && !current.isLeaf()){
            let nh = current.getInnerNodes().get(0); // next root

            if(nh != null){ // guard
                // update new root
                let newPos = new NodePosition(nh.clone());
                newPos.loadInnerNodes(this.store);

                newPos.setRoot(true);

                let nextfpos = newPos.getFpos();
                this.store.setRootFpos(nextfpos);

    //    #ifdef __DEBUG__
    //            const AbstractBtreeKey* key = newPos.getKey();
    //            assert(key.isInfinity());
    //    #endif

                // remove last root
                let fpos = current.getFpos();
                this.store.remove(fpos);

                this.pop();
                this.push(newPos);
                current = this.top();
            }
        }
    }

    private internalRemoveFromBottomToUpper() : void {
        let current = this.top(); // start from leaf
        // assert(current.isLeaf());

        if(!current.isEmpty()){
            return;
        }

        while(!current.isRoot() && current.isEmpty()){
            let key = current.getKey().clone();
            let fpos = current.getFpos();

            this.pop();
            //delete current;

            let upperNode = this.top();

            upperNode.removeChildNode(key, this.store);

            // if current is greatest in the sibling
            if(key.compareTo(upperNode.getKey()) == 0){
                let pos = upperNode.getInnerCount() - 1;

                if(pos >= 0){
                    let fpos = upperNode.getChildFpos(pos);

                    let nh = this.store.loadNode(fpos);
                    let chNode = new NodePosition(nh);
                    chNode.loadInnerNodes(this.store);
                    this.push(chNode);

                    this.setKeyForSelfAndDescendants(chNode, key);

                    this.pop();
                }

            }

            current = upperNode;
        }
    }

    private setKeyForSelfAndDescendants(current : NodePosition, key : AbstractBtreeKey) : void {
        current.setKey(key);
        current.save(this.store);

        if(!current.isLeaf()){
            let pos = current.getInnerCount() - 1;
            //assert(pos >= 0);

            let fpos = current.getChildFpos(pos);

            let nh = this.store.loadNode(fpos);
            let chNode = new NodePosition(nh);
            chNode.loadInnerNodes(this.store);
            this.push(chNode);

            this.setKeyForSelfAndDescendants(chNode, key);

            this.pop();
        }
    }    
}
