import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { AbstractBtreeKey } from "../../db/btree/AbstractBtreeKey";
import { BtreeKeyFactory } from "../../db/btreekey/BtreeKeyFactory";
import { UtxoIdKey } from "./UtxoIdKey";

export class UtxoIdKeyFactory extends BtreeKeyFactory {
    public static readonly UTXO_ID_KEY = 0x14;

    fromBinary(keyType : number, input : ByteBuffer) : AbstractBtreeKey {
        if(keyType == UtxoIdKeyFactory.UTXO_ID_KEY){
            return UtxoIdKey.fromBinary(input);
        }

        return super.fromBinary(keyType, input);
    }

    public copy() : BtreeKeyFactory {
        return new UtxoIdKeyFactory();
    }
}