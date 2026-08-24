import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { AbstractBtreeDataFactory } from "../../db/btree/AbstractBtreeDataFactory";
import { AbstractBtreeKey } from "../../db/btree/AbstractBtreeKey";
import { BtreeStorage } from "../../db/btree/BtreeStorage";
import { DataNode } from "../../db/btree/DataNode";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";
import { TransactionData } from "./TransactionData";


export class TransactionDataFactory extends AbstractBtreeDataFactory {

    public makeDataFromBinary(input : ByteBuffer) : IBlockObject {
        return TransactionData.fromBinary(input);
    }

    public registerData(key : AbstractBtreeKey, data : IBlockObject, dataNode : DataNode, store : BtreeStorage) : void {
        super.registerData(key, data, dataNode, store);
    }

    public beforeRemove(dataNode : DataNode, store : BtreeStorage, key : AbstractBtreeKey) : boolean {
        return true; // always remove
    }

    public copy() : AbstractBtreeDataFactory {
        return new TransactionDataFactory();
    }
}