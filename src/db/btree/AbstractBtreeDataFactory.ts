import { ByteBuffer } from "../base_io/ByteBuffer";
import { IBlockObject } from "../filestore_block/IBlockObject";
import { AbstractBtreeKey } from "./AbstractBtreeKey";
import { BtreeStorage } from "./BtreeStorage";
import { DataNode } from "./DataNode";


export abstract class AbstractBtreeDataFactory {
    public abstract makeDataFromBinary(input : ByteBuffer) : IBlockObject;
    public registerData(key : AbstractBtreeKey, data: IBlockObject, dataNode : DataNode, store: BtreeStorage) : void {
        let dataFpos = dataNode.getDataFpos();
        if(dataFpos != 0){
            store.removeData(dataFpos);
        }

        dataFpos = store.storeData(data);
        dataNode.setDataFpos(dataFpos);
    }
    public beforeRemove(dataNode : DataNode, store : BtreeStorage, key: AbstractBtreeKey) : boolean {
        return true;
    }
    public abstract copy() : AbstractBtreeDataFactory;
}