import { Schnorr } from "../../base/crypto/Schnorr";
import { SchnorrSignature } from "../../base/crypto/SchnorrSignature";
import { Sha256 } from "../../base/crypto/Sha256";
import { NullPointerException } from "../../db/base/NullPointerException";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { AddressDescriptor } from "../bc_base/AddressDescriptor";
import { BalanceUnit } from "../bc_base/BalanceUnit";
import { BlockHeaderId } from "../bc_block/BlockHeaderId";
import { NodeIdentifier } from "../bc_network/NodeIdentifier";
import { NodeIdentifierSource } from "../bc_network/NodeIdentifierSource";
import { AbstractUtxo } from "../bc_trx/AbstractUtxo";
import { AbstractUtxoReference } from "../bc_trx/AbstractUtxoReference";
import { TransactionId } from "../bc_trx/TransactionId";
import { UtxoId } from "../bc_trx/UtxoId";
import { AbstractFinalizerTransaction } from "./AbstractFinalizerTransaction";
import { TicketUtxoReference } from "./TicketUtxoReference";
import { TicketVotedUtxo } from "./TicketVotedUtxo";


export class VoteBlockTransaction extends AbstractFinalizerTransaction {
	private zone : number;
	private voterId : NodeIdentifier | null;
	private ticketUtxoRef : TicketUtxoReference | null;
	private votedUtxo : TicketVotedUtxo | null;

	private voteBlockHeaderId : BlockHeaderId | null; // voted block header
	private voteBlockHeight : number; // of voted block

	private sig : SchnorrSignature | null;

    constructor(){
        super();
        this.zone = 0;
        this.voterId = null;
        this.ticketUtxoRef = null;
        this.votedUtxo = null;

        this.voteBlockHeaderId = null;
        this.voteBlockHeight = 0;
        this.sig = null;        
    }

    public getType() : number {
        return AbstractFinalizerTransaction.TRX_TYPE_VOTE_BLOCK;
    }

    public setVoteBlockHeight(voteBlockHeight : number) : void {
		this.voteBlockHeight = voteBlockHeight;
	}
	public getVotedHeaderId() : BlockHeaderId {
        if(this.voteBlockHeaderId != null){
            return this.voteBlockHeaderId;
        }
		throw new NullPointerException("VoteBlockTransaction.getVotedHeaderId()");
	}
	public getVotedHeaderBlockHeight() : number {
		return this.voteBlockHeight;
	}
	public getTicketUtxoReference() : TicketUtxoReference {
        if(this.ticketUtxoRef != null){
            return this.ticketUtxoRef;
        }
		throw new NullPointerException("VoteBlockTransaction.getTicketUtxoReference()");
	}
	public getTicketVotedUtxo() : TicketVotedUtxo {
        if(this.votedUtxo != null){
            return this.votedUtxo;
        }
		throw new NullPointerException("VoteBlockTransaction.getTicketVotedUtxo()");
	}

    public binarySize() : number {
        if(this.voterId != null && this.ticketUtxoRef != null && this.votedUtxo != null
            && this.voteBlockHeaderId != null && this.sig != null){
            let total = super.__binarySize();

            total += 2; // sizeof(uint16_t); // zone
            total += this.voterId.binarySize();
            total += this.ticketUtxoRef.binarySize();
            total += this.votedUtxo.binarySize();
            total += this.voteBlockHeaderId.binarySize();
            total += 8; //sizeof(this.voteBlockHeight);

            total += this.sig.binarySize();

            return total;
        }
        throw new NullPointerException("VoteBlockTransaction.binarySize()");
    }

    public toBinary(out : ByteBuffer) : void {
        if(this.voterId != null && this.ticketUtxoRef != null && this.votedUtxo != null
            && this.voteBlockHeaderId != null && this.sig != null){
            super.__toBinary(out);

            out.putShort(this.zone);
            this.voterId.toBinary(out);
            this.ticketUtxoRef.toBinary(out);
            this.votedUtxo.toBinary(out);
            this.voteBlockHeaderId.toBinary(out);
            out.putLong(this.voteBlockHeight);

            this.sig.toBinary(out);
        }
        throw new NullPointerException("VoteBlockTransaction.toBinary()");
    }

    public fromBinary(input : ByteBuffer) {
        super.__fromBinary(input);

        input.putShort(this.zone);
        this.voterId = NodeIdentifier.fromBinary(input);

        let ref = AbstractUtxoReference.createFromBinary(input);
        this.ticketUtxoRef = <TicketUtxoReference>(ref);

        let vutxo = AbstractUtxo.createFromBinary(input);
        this.votedUtxo = <TicketVotedUtxo>(vutxo);

        this.voteBlockHeaderId = BlockHeaderId.fromBinary(input);
        this.voteBlockHeight = Number(input.getLong());

        this.sig = SchnorrSignature.createFromBinary(input);
    }

    public build() : void {
        if(this.voterId != null && this.ticketUtxoRef != null && this.votedUtxo != null
            && this.voteBlockHeaderId != null && this.sig != null){
            this.setUtxoNonce();

            let capacity = this.__binarySize();
            capacity += 2; // sizeof(uint16_t); // zone
            capacity += this.voterId.binarySize();
            capacity += this.ticketUtxoRef.binarySize();
            capacity += this.votedUtxo.binarySize();
            capacity += this.voteBlockHeaderId.binarySize();
            capacity += 8; // sizeof(this.voteBlockHeight);

            let buff = ByteBuffer.allocateWithEndian(capacity, true);

            this.__toBinary(buff);
            buff.putShort(this.zone);
            this.voterId.toBinary(buff);
            this.ticketUtxoRef.toBinary(buff);
            this.votedUtxo.toBinary(buff);
            this.voteBlockHeaderId.toBinary(buff);
            buff.putLong(this.voteBlockHeight);

            buff.position(0);

            let sha = Sha256.sha256(buff.toUint8Array(), true);

            this.trxId = new TransactionId(sha.toUint8Array(), sha.limit());
            return;
        }
        throw new NullPointerException("VoteBlockTransaction.build()");
    }

    public getUtxoReferenceSize() : number {
        return super.getUtxoReferenceSize() + 1;
    }

    public getUtxoReference(i : number) : AbstractUtxoReference {
        if(this.ticketUtxoRef != null){
            let cap = super.getUtxoReferenceSize();
            return i < cap ? super.getUtxoReference(i) : this.ticketUtxoRef;
        }
        throw new NullPointerException("VoteBlockTransaction.getUtxoReference()");
    }

    public getUtxoSize() : number {
        return super.getUtxoSize() + 1;
    }

    public getUtxo(i : number) : AbstractUtxo {
        if(this.votedUtxo != null){
            let cap = super.getUtxoSize();
            return i < cap ? super.getUtxo(i) : this.votedUtxo;
        }
        throw new NullPointerException("VoteBlockTransaction.getUtxo()");
    }

    public setVoterId(voterId : NodeIdentifier) : void {
        this.voterId = <NodeIdentifier>voterId.copyData();
    }

    public setTicketUtxoId(utxoId : UtxoId, amount : BalanceUnit, desc : AddressDescriptor) : void {
        this.ticketUtxoRef = new TicketUtxoReference();
        this.ticketUtxoRef.setUtxoId(utxoId, desc);

        this.votedUtxo = new TicketVotedUtxo();
        this.votedUtxo.setAddress(desc);
        this.votedUtxo.setVotedUtxoId(utxoId);
        this.votedUtxo.setAmount(amount);
    }

    public setVoteBlockId(voteBlockHeaderId : BlockHeaderId) : void {
        this.voteBlockHeaderId = <BlockHeaderId>voteBlockHeaderId.copyData();
    }

    public signVoted(source : NodeIdentifierSource) : void {
        if(this.trxId != null && this.voterId != null){
            let data = this.trxId.toArray();
            let length = this.trxId.size();

            this.sig = Schnorr.sign(source.getSecretKey(), this.voterId.getPublicKey(), data, length);
            return;
        }

    }

    public verify() : boolean {
        if(this.trxId != null && this.voterId != null && this.sig != null){
            let data = this.trxId.toArray();
            let length = this.trxId.size();

            let result = Schnorr.verifySig(this.sig, this.voterId.getPublicKey(), data, length);
            return result;
        }
        throw new NullPointerException("VoteBlockTransaction.verify()");
    }

    public setFeeAmount(fee : BalanceUnit) {
        this.fee = <BalanceUnit>fee.copyData();
    }

    public setZone(z : number) : void {
        this.zone = z;
    }
}