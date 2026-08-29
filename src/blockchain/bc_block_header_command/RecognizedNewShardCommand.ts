import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";
import { NotifyZoneExtendRequestedTransaction } from "../bc_status_cache_extend_shard/NotifyZoneExtendRequestedTransaction";
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
        throw new Error("Method not implemented.");
    }
    public toBinary(out: ByteBuffer): void {
        throw new Error("Method not implemented.");
    }
    public fromBinary(input: ByteBuffer): void {
        throw new Error("Method not implemented.");
    }

    public copyData(): IBlockObject {
        throw new Error("Method not implemented.");
    }


    // TODO implements
}