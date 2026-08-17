import { ByteBuffer } from "../base_io/ByteBuffer";
import { IBlockObject } from "../filestore_block/IBlockObject";
import { AbstractBtreeKey } from "./AbstractBtreeKey";
import { BtreeStorage } from "./BtreeStorage";
import { DataNode } from "./DataNode";


export abstract class AbstractBtreeDataFactory {
    public abstract makeDataFromBinary(input : ByteBuffer) : IBlockObject;
    public abstract registerData(key : AbstractBtreeKey, data: IBlockObject, dataNode : DataNode, store: BtreeStorage) : void;
    public abstract beforeRemove(dataNode : DataNode, store : BtreeStorage, key: AbstractBtreeKey) : boolean;
}