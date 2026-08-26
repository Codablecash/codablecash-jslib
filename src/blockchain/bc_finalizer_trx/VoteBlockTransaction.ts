import { SchnorrSignature } from "../../base/crypto/SchnorrSignature";
import { NodeIdentifier } from "../bc_network/NodeIdentifier";
import { AbstractFinalizerTransaction } from "./AbstractFinalizerTransaction";
import { TicketUtxoReference } from "./TicketUtxoReference";
import { TicketVotedUtxo } from "./TicketVotedUtxo";


export class VoteBlockTransaction extends AbstractFinalizerTransaction {
	private zone : number;
	private voterId : NodeIdentifier;
	private ticketUtxoRef : TicketUtxoReference;
	private votedUtxo : TicketVotedUtxo;

	private voteBlockHeaderId : BlockHeaderId; // voted block header
	private voteBlockHeight : number; // of voted block

	private sig : SchnorrSignature;
}