import { IBlockObject } from "../filestore_block/IBlockObject";
import { AbstractBtreeKey } from "./AbstractBtreeKey";
import { BtreeStorage } from "./BtreeStorage";
import { NodeHandle } from "./NodeHandle";

export class NodeCursor {


    constructor(rootNode : NodeHandle, store : BtreeStorage, nodeNumber : number) {

    }

    public insert(key : AbstractBtreeKey, data : IBlockObject) : void {
        /*NodePosition* current = top();
        __ASSERT_TREE

        // check data nodes
        current->loadInnerNodes(this->store);

        // down to leaf node
        while(!current->isLeaf()){
            uint64_t nextFpos = current->getNextChild(key);
            NodeHandle* nh = this->store->loadNode(nextFpos);

            current = new NodePosition(nh);
            push(current);

            current->loadInnerNodes(this->store);
        }

        // 1. already has key
        NodeHandle* sameKeyDataNode = current->hasKey(key);
        if(sameKeyDataNode != nullptr){
            DataNode* dnode = sameKeyDataNode->toDataNode();

            const AbstractBtreeDataFactory* dfactory = this->store->getDataFactory();
            dfactory->registerData(key, data, dnode, this->store);

            this->store->updateNode(dnode);

            return;
        }

        // 2. Add key, then check whether the node is full or not
        if(current->isFull(this->nodeNumber)){
            splitLeafNode(key, data);

            return;
        }

        // simply add data
        DataNode dataNode(key->clone());

        const AbstractBtreeDataFactory* dfactory = this->store->getDataFactory();
        dfactory->registerData(key, data, &dataNode, this->store);

        uint64_t newDataNodeFpos = this->store->storeNode(&dataNode);

        current->addNode(key, newDataNodeFpos, this->nodeNumber);
        current->save(this->store);

        current->loadInnerNodes(this->store);*/
    }
}
