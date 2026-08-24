import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { SystemTimestamp } from "../../db/base_timestamp/SystemTimestamp";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";
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

    constructor() {
        this.trxId = null;
        this.timestamp = new SystemTimestamp();
        this.version = new TransactionVersion(1, 0 , 0);        
    }

    binarySize(): number {
        throw new Error("Method not implemented.");
    }
    toBinary(out: ByteBuffer): void {
        throw new Error("Method not implemented.");
    }
    copyData(): IBlockObject {
        throw new Error("Method not implemented.");
    }

}