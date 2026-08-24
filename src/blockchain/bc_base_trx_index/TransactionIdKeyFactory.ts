import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { AbstractBtreeKey } from "../../db/btree/AbstractBtreeKey";
import { BtreeKeyFactory } from "../../db/btreekey/BtreeKeyFactory";

export class TransactionIdKeyFactory extends BtreeKeyFactory {
    public static readonly TRANSACTION_ID_KEY = 0x14;

    public fromBinary(keyType : number, input : ByteBuffer) : AbstractBtreeKey {
        if(keyType == TransactionIdKeyFactory.TRANSACTION_ID_KEY){
            let key = TransactionIdKey.fromBinary(input);
            return key;
        }

        return BtreeKeyFactory.fromBinary(keyType, input);
    }

    public copy() : BtreeKeyFactory {
        return new TransactionIdKeyFactory();
    }
}