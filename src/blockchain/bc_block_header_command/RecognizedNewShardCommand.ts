import { MerkleCertificate } from "../merkletree/MerkleCertificate";
import { AbstractBlockHeaderCommand } from "./AbstractBlockHeaderCommand";

export class RecognizedNewShardCommand extends AbstractBlockHeaderCommand {
	private trx : NotifyZoneExtendRequestedTransaction;
	private certificate : MerkleCertificate;

    constructor(){
        super(AbstractBlockHeaderCommand.RECOGNIZED_SHARD_COMMAND);
    }


    // TODO implements
}