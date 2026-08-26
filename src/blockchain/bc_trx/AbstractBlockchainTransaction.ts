import { NullPointerException } from "../../db/base/NullPointerException";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { SystemTimestamp } from "../../db/base_timestamp/SystemTimestamp";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";
import { BalanceUnit } from "../bc_base/BalanceUnit";
import { AbstractUtxo } from "./AbstractUtxo";
import { AbstractUtxoReference } from "./AbstractUtxoReference";
import { TransactionId } from "./TransactionId";
import { TransactionVersion } from "./TransactionVersion";


export abstract class AbstractBlockchainTransaction implements IBlockObject{
    public static readonly TRX_TYPE_GENESIS = 1;
    public static readonly TRX_TYPE_BANANCE_TRANSFER = 1;

    public static readonly TRX_TYPE_REGISTER_VOTE_POOL = 1;
    public static readonly TRX_TYPE_REGISTER_TICKET = 1;
    public static readonly TRX_TYPE_VOTE_BLOCK = 1;
    public static readonly TRX_TYPE_REVOKE_MISSED_TICKET = 1;
    public static readonly TRX_TYPE_REVOKE_MISS_VOTED_TICKET = 1;

    public static readonly TRX_TYPE_COIN_BASE = 1;
    public static readonly TRX_TYPE_STAKE_BASE = 1;

    protected trxId : TransactionId | null;
    protected timestamp : SystemTimestamp;
    protected version : TransactionVersion;

    public static createFromBinary(input : ByteBuffer) : AbstractBlockchainTransaction {
        throw new Error("not implemented");
        /*let ret : AbstractBlockchainTransaction;
        
        ret.fromBinary();
        ret.build();

        return ret;*/
    }

    constructor() {
        this.trxId = null;
        this.timestamp = new SystemTimestamp();
        this.version = new TransactionVersion(1, 0 , 0);        
    }

	public getTransactionId() : TransactionId {
        if(this.trxId != null){
            return this.trxId;
        }
		throw new NullPointerException("AbstractBlockchainTransaction.getTransactionId()");
	}

    public abstract getType() : number;
    public abstract build() : void;

	public abstract getFee() : BalanceUnit;
	public abstract getFeeRate() : BalanceUnit;

	public abstract getUtxoSize() : number;
	public abstract getUtxo(i : number) : AbstractUtxo;
	public abstract getUtxoReferenceSize(): number;
	public abstract getUtxoReference(i : number) : AbstractUtxoReference;

    public abstract binarySize(): number;
    public abstract toBinary(out: ByteBuffer): void;
    public abstract fromBinary(input: ByteBuffer): void;

    public copyData(): IBlockObject {
        let cap = this.binarySize();
        let buff = ByteBuffer.allocateWithEndian(cap, true);

        this.toBinary(buff);
        buff.position(0);

        return AbstractBlockchainTransaction.createFromBinary(buff);
    }

	public getTimestamp() : SystemTimestamp {
		return this.timestamp;
	}

}