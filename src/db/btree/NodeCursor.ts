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
        /* let current = this.top();
        //__ASSERT_TREE

        // check data nodes
        current.loadInnerNodes(this.store);

        // down to leaf node
        while(!current.isLeaf()){
            uint64_t nextFpos = current.getNextChild(key);
            NodeHandle* nh = this.store.loadNode(nextFpos);

            current = new NodePosition(nh);
            this.push(current);

            current.loadInnerNodes(this.store);
        }

        // 1. already has key
        NodeHandle* sameKeyDataNode = current.hasKey(key);
        if(sameKeyDataNode != nullptr){
            DataNode* dnode = sameKeyDataNode.toDataNode();

            const AbstractBtreeDataFactory* dfactory = this.store.getDataFactory();
            dfactory.registerData(key, data, dnode, this.store);

            this.store.updateNode(dnode);

            return;
        }

        // 2. Add key, then check whether the node is full or not
        if(current.isFull(this.nodeNumber)){
            splitLeafNode(key, data);

            return;
        }

        // simply add data
        DataNode dataNode(key.clone());

        const AbstractBtreeDataFactory* dfactory = this.store.getDataFactory();
        dfactory.registerData(key, data, &dataNode, this.store);

        uint64_t newDataNodeFpos = this.store.storeNode(&dataNode);

        current.addNode(key, newDataNodeFpos, this.nodeNumber);
        current.save(this.store);

        current.loadInnerNodes(this.store);*/
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
    
    public find(key : AbstractBtreeKey) : IBlockObject {
        /*if(this.store != null){
            let leafNode = this.gotoLeaf(key);

            let nh = leafNode.gotoEqKey(key);
            if(nh == null){
                return null;
            }

            let dataNode = nh.toDataNode();

            let dataFpos = dataNode.getDataFpos();

            return this.store.loadData(dataFpos);
        }*/
        throw new NullPointerException("NodeCursor.find()");
    }
}
