import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { SystemTimestampKey } from "../../db/base_timestamp/SystemTimestampKey";
import { AbstractBtreeDataFactory } from "../../db/btree/AbstractBtreeDataFactory";
import { AbstractBtreeKey } from "../../db/btree/AbstractBtreeKey";
import { BtreeStorage } from "../../db/btree/BtreeStorage";
import { DataNode } from "../../db/btree/DataNode";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";
import { TransactionId } from "../bc_trx/TransactionId";
import { WalletTransactionIdListData } from "./WalletTransactionIdListData";


export class WalletTransactionIdListDataFactory extends AbstractBtreeDataFactory {

    public makeDataFromBinary(input : ByteBuffer) : IBlockObject {
        return WalletTransactionIdListData.fromBinary(input);
    }

    public registerData(key : AbstractBtreeKey, data : IBlockObject, dataNode : DataNode, store : BtreeStorage)  {
        let dataFpos = dataNode.getDataFpos();
        if(dataFpos != 0){
            let obj = store.loadData(dataFpos);

            let baseValue = <WalletTransactionIdListData>(obj);
            let newValue = <WalletTransactionIdListData>(data);

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
        let baseValue = <WalletTransactionIdListData>(obj);

        let fkey = <SystemTimestampKey>(key);

        let value = <TransactionId>(fkey.getRemoveKey());
        baseValue.remove(value);

        if(baseValue.isEmpty()){
            return true; // remove
        }

        dataFpos = store.storeData(baseValue, dataFpos);
        dataNode.setDataFpos(dataFpos);

        return false; // do not remove
    }

    public copy() : AbstractBtreeDataFactory {
        return new WalletTransactionIdListDataFactory();
    }

}