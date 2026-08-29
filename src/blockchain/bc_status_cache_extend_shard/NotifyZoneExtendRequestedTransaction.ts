import { Sha256 } from "../../base/crypto/Sha256";
import { NullPointerException } from "../../db/base/NullPointerException";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { SystemTimestamp } from "../../db/base_timestamp/SystemTimestamp";
import { BalanceUnit } from "../bc_base/BalanceUnit";
import { BlockHeaderId } from "../bc_block/BlockHeaderId";
import { BlockHeaderCommandId } from "../bc_block_header_command/BlockHeaderCommandId";
import { AbstractBlockchainTransaction } from "../bc_trx/AbstractBlockchainTransaction";
import { AbstractInterChainCommunicationTansaction } from "../bc_trx/AbstractInterChainCommunicationTansaction";
import { AbstractUtxo } from "../bc_trx/AbstractUtxo";
import { AbstractUtxoReference } from "../bc_trx/AbstractUtxoReference";
import { TransactionId } from "../bc_trx/TransactionId";
import { TransactionVersion } from "../bc_trx/TransactionVersion";
import { UtxoId } from "../bc_trx/UtxoId";

export class NotifyZoneExtendRequestedTransaction extends AbstractInterChainCommunicationTansaction {
	// header info
	private zone : number;
	private height : number;
	private headerId : BlockHeaderId | null;

	// new shard info
	private newShardZone : number;

	// Header Command Info
	private commandId : BlockHeaderCommandId | null;

	// build automatically
	private utxoId : UtxoId | null;

    constructor(){
        super();
        this.zone = 0;
        this.height = 0;
        this.headerId = null;

        this.newShardZone = 0;

        this.utxoId = null;
        this.commandId = null;        
    }

    public getType(): number {
        return AbstractBlockchainTransaction.TRX_TYPE_ICC_ZONE_EXTEND_REQUESTED;
    }

    public getFee(): BalanceUnit {
        return new BalanceUnit(0);
    }
    public getFeeRate(): BalanceUnit {
        return new BalanceUnit(0);
    }

    public getUtxoSize(): number {
        return 0;
    }
    public getUtxo(i: number): AbstractUtxo {
        throw new Error("Method not implemented.");
    }
    public getUtxoReferenceSize(): number {
        return 0;
    }
    public getUtxoReference(i: number): AbstractUtxoReference {
        throw new Error("Method not implemented.");
    }

    public binarySize(): number {
        if(this.headerId != null && this.commandId != null){
            let total = 1; // sizeof(uint8_t);
            total += this.version.binarySize();
            total += this.timestamp.binarySize();

            total += 2; // sizeof(uint16_t); // zone
            total += 8; //sizeof(uint64_t); // height
            total += this.headerId.binarySize();

            total += 2; //sizeof(this.newShardZone);

            total += this.commandId.binarySize();

            return total;
        }
        throw new NullPointerException("NotifyZoneExtendRequestedTransaction.binarySize()");
    }
    public toBinary(out: ByteBuffer): void {
        if(this.headerId != null && this.commandId != null){
            out.put(this.getType());

            this.version.toBinary(out);
            this.timestamp.toBinary(out);

            out.putShort(this.zone);
            out.putLong(this.height);
            this.headerId.toBinary(out);

            out.putShort(this.newShardZone);

            this.commandId.toBinary(out);
        }
    }
    public fromBinary(input: ByteBuffer): void {
        this.version = TransactionVersion.createFromBinary(input);

        this.timestamp = SystemTimestamp.fromBinary(input);

        this.zone = input.getShort();
        this.height = Number(input.getLong());
        this.headerId = BlockHeaderId.fromBinary(input);

        this.newShardZone = input.getShort();

        this.commandId = BlockHeaderCommandId.fromBinary(input);

        this.build();
    }

    public build(): void {
        if(this.headerId != null && this.commandId != null){
            let capacity = 1 + this.version.binarySize() /*+ this.timestamp.binarySize()*/;
            capacity += 2 + 8 + this.headerId.binarySize() + 2
                    + this.commandId.binarySize();

            let buff = ByteBuffer.allocateWithEndian(capacity, true);
            buff.put(this.getType());

            this.version.toBinary(buff);
            //this.timestamp.toBinary(buff);

            buff.putShort(this.zone);
            buff.putLong(this.height);
            this.headerId.toBinary(buff);

            buff.putShort(this.newShardZone);

            this.commandId.toBinary(buff);

            buff.position(0);
            let sha = Sha256.sha256(buff.toUint8Array(), true);

            this.trxId = new TransactionId(sha.toUint8Array(), sha.limit());
        }

        if(this.headerId != null && this.commandId != null){
            let capacity =  2 + 8 + this.headerId.binarySize();

            let buff = ByteBuffer.allocateWithEndian(capacity, true);
            buff.putShort(this.zone);
            buff.putLong(this.height);
            this.headerId.toBinary(buff);

            buff.position(0);

            let sha = Sha256.sha256(buff.toUint8Array(), true);

            this.utxoId = null;
            this.utxoId = new UtxoId(sha.toUint8Array(), sha.limit());
        }
    }
}