import { ArrayList } from "../base/ArrayList";
import { NullPointerException } from "../base/NullPointerException";
import { IBlockObject } from "../filestore_block/IBlockObject";
import { AbstractBtreeKey } from "./AbstractBtreeKey";
import { BtreeStorage } from "./BtreeStorage";
import { NodeHandle } from "./NodeHandle";
import { NodePosition } from "./NodePosition";

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
