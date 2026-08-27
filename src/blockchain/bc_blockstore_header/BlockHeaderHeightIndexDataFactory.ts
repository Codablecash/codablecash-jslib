import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { AbstractBtreeDataFactory } from "../../db/btree/AbstractBtreeDataFactory";
import { AbstractBtreeKey } from "../../db/btree/AbstractBtreeKey";
import { BtreeStorage } from "../../db/btree/BtreeStorage";
import { DataNode } from "../../db/btree/DataNode";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";
import { BlockHeaderHeightIndexKey } from "./BlockHeaderHeightIndexKey";
import { BlockHeaderList } from "./BlockHeaderList";

export class BlockHeaderHeightIndexDataFactory extends AbstractBtreeDataFactory {

    public makeDataFromBinary(input : ByteBuffer) : IBlockObject {
        return BlockHeaderList.fromBinary(input);
    }

    public registerData(key : AbstractBtreeKey, data : IBlockObject, dataNode : DataNode, store : BtreeStorage) : void {
        let dataFpos = dataNode.getDataFpos();
        if(dataFpos != 0){
            let obj = store.loadData(dataFpos);

            let baseValue = <BlockHeaderList>(obj);
            let newValue = <BlockHeaderList>(data);

            baseValue.join(newValue);
            dataFpos = store.storeData(baseValue, dataFpos);
            dataNode.setDataFpos(dataFpos);

            return;
        }

        dataFpos = store.storeData(data);
        dataNode.setDataFpos(dataFpos);
    }

    public beforeRemove(dataNode : DataNode, store : BtreeStorage, key : AbstractBtreeKey) : boolean {
        let dataFpos = dataNode.getDataFpos();

        let obj = store.loadData(dataFpos);
        let baseValue = <BlockHeaderList>(obj);

        let fkey = <BlockHeaderHeightIndexKey>(key);

        let value = fkey.getFpos();
        baseValue.remove(value);

        if(baseValue.isEmpty()){
            return true; // remove
        }

        dataFpos = store.storeData(baseValue, dataFpos);
        dataNode.setDataFpos(dataFpos);

        return false; // do not remove
    }

    public copy() : AbstractBtreeDataFactory {
        return new BlockHeaderHeightIndexDataFactory();
    }

}