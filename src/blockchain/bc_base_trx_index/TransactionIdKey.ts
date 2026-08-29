import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { AbstractBtreeKey } from "../../db/btree/AbstractBtreeKey";
import { TransactionId } from "../bc_trx/TransactionId";
import { TransactionIdKeyFactory } from "./TransactionIdKeyFactory";

export class TransactionIdKey extends AbstractBtreeKey {
    private trxId : TransactionId;

    constructor(trxId : TransactionId){
        super();
        this.trxId = <TransactionId>trxId.copyData();
    }

	public isInfinity() : boolean { return false; }
	public isNull() : boolean { return false; }

    public binarySize() : number {
        let size = 4; // sizeof(uint32_t);
        size += this.trxId.binarySize();

        return size;
    }

    public toBinary(out : ByteBuffer) : void {
        out.putInt(TransactionIdKeyFactory.TRANSACTION_ID_KEY);

        this.trxId.toBinary(out);
    }

    public static fromBinary(input : ByteBuffer) : TransactionIdKey {
        let trxId = TransactionId.fromBinary(input);

        return new TransactionIdKey(trxId);
    }

    public compareTo(key : AbstractBtreeKey) : number {
        if(key.isInfinity()){
            return -1;
        }
        else if(key.isNull()){
            return 1;
        }

        let other = <TransactionIdKey>(key);
        //assert(other != nullptr);

        return this.trxId.compareTo(other.trxId);
    }

    public clone() : AbstractBtreeKey {
        return new TransactionIdKey(this.trxId);
    }
}