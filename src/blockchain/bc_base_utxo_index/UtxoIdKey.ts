import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { AbstractBtreeKey } from "../../db/btree/AbstractBtreeKey";
import { UtxoId } from "../bc_trx/UtxoId";
import { UtxoIdKeyFactory } from "./UtxoIdKeyFactory";


export class UtxoIdKey extends AbstractBtreeKey {
    private utxoId : UtxoId;

    constructor(utxoId : UtxoId){
        super();
        this.utxoId = <UtxoId>utxoId.copyData();
    }

    public binarySize(): number {
        let size = 4; // sizeof(uint32_t);
        size += this.utxoId.binarySize();

        return size;
    }
    public toBinary(out: ByteBuffer): void {
        out.putInt(UtxoIdKeyFactory.UTXO_ID_KEY);

        this.utxoId.toBinary(out);
    }
    public static fromBinary(input : ByteBuffer) : UtxoIdKey {
        let utxoId = UtxoId.fromBinary(input);

        return new UtxoIdKey(utxoId);
    }
    
    public isInfinity(): boolean {
        return false;
    }
    public isNull(): boolean {
        return false;
    }
    
    public compareTo(key: AbstractBtreeKey): number {
        if(key.isInfinity()){
            return -1;
        }
        else if(key.isNull()){
            return 1;
        }

        let other = <UtxoIdKey>(key);
        return this.utxoId.compareTo(other.utxoId);
    }

    public clone(): AbstractBtreeKey {
        return new UtxoIdKey(this.utxoId);
    }
}