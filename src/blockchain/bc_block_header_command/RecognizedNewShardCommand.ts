import { NullPointerException } from "../../db/base/NullPointerException";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";
import { NotifyZoneExtendRequestedTransaction } from "../bc_status_cache_extend_shard/NotifyZoneExtendRequestedTransaction";
import { AbstractBlockchainTransaction } from "../bc_trx/AbstractBlockchainTransaction";
import { MerkleCertificate } from "../merkletree/MerkleCertificate";
import { AbstractBlockHeaderCommand } from "./AbstractBlockHeaderCommand";

export class RecognizedNewShardCommand extends AbstractBlockHeaderCommand {

	private trx : NotifyZoneExtendRequestedTransaction | null;
	private certificate : MerkleCertificate | null;

    constructor(){
        super(AbstractBlockHeaderCommand.RECOGNIZED_SHARD_COMMAND);

        this.trx = null;
        this.certificate = null;
    }

    public binarySize(): number {
        if(this.trx != null && this.certificate != null){
            let total = 2; // sizeof(uint16_t);

            total += this.trx.binarySize();
            total += this.certificate.binarySize();

            return total;
        }
        throw new NullPointerException("RecognizedNewShardCommand.binarySize()");
    }
    public toBinary(out: ByteBuffer): void {
        if(this.trx != null && this.certificate != null){
            out.putShort(this.type);

            this.trx.toBinary(out);
            this.certificate.toBinary(out);
        }
    }
    public fromBinary(input: ByteBuffer): void {
        let atrx = AbstractBlockchainTransaction.createFromBinary(input);
        let ntrx = <NotifyZoneExtendRequestedTransaction>(atrx);

        this.trx = ntrx;

        this.certificate = MerkleCertificate.createFromBinary(input);
    }

    public copyData(): IBlockObject {
        if(this.trx != null && this.certificate != null){
            let inst = new RecognizedNewShardCommand();
            inst.trx = <NotifyZoneExtendRequestedTransaction>this.trx.copyData();
            inst.certificate = <MerkleCertificate>this.certificate.copyData();

            inst.buildCommandId();

            return inst;
        }
        throw new NullPointerException("RecognizedNewShardCommand.copyData()");
    }
}