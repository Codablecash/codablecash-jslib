import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { AbstractBtreeDataFactory } from "../../db/btree/AbstractBtreeDataFactory";
import { AbstractBtreeKey } from "../../db/btree/AbstractBtreeKey";
import { BtreeStorage } from "../../db/btree/BtreeStorage";
import { DataNode } from "../../db/btree/DataNode";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";
import { HeaderTransactionGroup } from "./HeaderTransactionGroup";

export class HeaderTransactionGroupDataFactory extends AbstractBtreeDataFactory {

    public makeDataFromBinary(input : ByteBuffer) : IBlockObject {
        return HeaderTransactionGroup.createFromBinary(input);

    }

    public registerData(key : AbstractBtreeKey, data : IBlockObject, dataNode : DataNode, store : BtreeStorage) : void {
        let dataFpos = dataNode.getDataFpos();

        if(dataFpos != 0){
            let obj = store.loadData(dataFpos);

            let baseValue = <HeaderTransactionGroup>(obj);
            let newValue = <HeaderTransactionGroup>(data);

            baseValue.join(newValue);
            dataFpos = store.storeData(baseValue, dataFpos);
            dataNode.setDataFpos(dataFpos);

            return;
        }

        dataFpos = store.storeData(data);
        dataNode.setDataFpos(dataFpos);
    }

    public copy() : AbstractBtreeDataFactory {
        return new HeaderTransactionGroupDataFactory();
    }
}