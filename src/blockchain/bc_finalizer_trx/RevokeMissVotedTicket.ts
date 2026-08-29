import { Sha256 } from "../../base/crypto/Sha256";
import { NullPointerException } from "../../db/base/NullPointerException";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { SystemTimestamp } from "../../db/base_timestamp/SystemTimestamp";
import { AbstractBlockchainTransaction } from "../bc_trx/AbstractBlockchainTransaction";
import { AbstractUtxo } from "../bc_trx/AbstractUtxo";
import { AbstractUtxoReference } from "../bc_trx/AbstractUtxoReference";
import { TransactionId } from "../bc_trx/TransactionId";
import { TransactionVersion } from "../bc_trx/TransactionVersion";
import { BalanceUtxo } from "../bc_trx_balance/BalanceUtxo";
import { AbstractRevokeTransaction } from "./AbstractRevokeTransaction";
import { TicketVotedUtxoReference } from "./TicketVotedUtxoReference";

export class RevokeMissVotedTicket extends AbstractRevokeTransaction {
    private ticketVoteUtxoRef : TicketVotedUtxoReference | null;

    constructor(){
        super();
        this.ticketVoteUtxoRef = null;
    }

    public getType() : number {
		return AbstractBlockchainTransaction.TRX_TYPE_REVOKE_MISS_VOTED_TICKET;
	}
	public getTicketVotedUtxoReference() : TicketVotedUtxoReference{
        if(this.ticketVoteUtxoRef != null){
            return this.ticketVoteUtxoRef;
        }
		throw new NullPointerException("RevokeMissVotedTicket.getTicketVotedUtxoReference()");
	}

    public binarySize() : number {
        if(this.ticketVoteUtxoRef != null){
            let total = 1; // sizeof(uint8_t);
            total += this.version.binarySize();
            total += this.timestamp.binarySize();
            total += this.ticketVoteUtxoRef.binarySize();

            let maxLoop = this.list.size();
            total += 1; // sizeof(uint8_t);

            for(let i = 0; i != maxLoop; ++i){
                let utxo = this.list.get(i);
                if(utxo != null){ // guard
                    total += utxo.binarySize();
                }
            }

            return total;
        }
        throw new NullPointerException("RevokeMissVotedTicket.binarySize()");
    }

    public toBinary(out : ByteBuffer) : void {
        if(this.ticketVoteUtxoRef != null){
            out.put(this.getType());
            this.version.toBinary(out);
            this.timestamp.toBinary(out);
            this.ticketVoteUtxoRef.toBinary(out);

            let maxLoop = this.list.size();
            out.put(maxLoop);

            for(let i = 0; i != maxLoop; ++i){
                let utxo = this.list.get(i);
                utxo?.toBinary(out);
            }
            return;
        }
        throw new NullPointerException("RevokeMissVotedTicket.toBinary()");
    }

    public fromBinary(input : ByteBuffer) {
        this.version = TransactionVersion.createFromBinary(input);
        this.timestamp = SystemTimestamp.fromBinary(input);

        let ref = AbstractUtxoReference.createFromBinary(input);
        this.ticketVoteUtxoRef = <TicketVotedUtxoReference>(ref);

        let maxLoop = input.get();
        for(let i = 0; i != maxLoop; ++i){
            let u = AbstractUtxo.createFromBinary(input);
            let utxo = <BalanceUtxo>(u);

            this.list.addElement(utxo);
        }
    }

    public build() : void {
        this.setUtxoNonce();

        let capacity = this.__binarySize();
        let buff = ByteBuffer.allocateWithEndian(capacity, true);

        this.__toBinary(buff);

        buff.position(0);

        let sha = Sha256.sha256(buff.toUint8Array(), true);

        this.trxId = new TransactionId(sha.toUint8Array(), sha.limit());
    }

    public getUtxoReference(i : number) : AbstractUtxoReference {
        if(this.ticketVoteUtxoRef != null){
            return this.ticketVoteUtxoRef;
        }
        throw new NullPointerException("RevokeMissVotedTicket.getUtxoReference()");
    }

    public getUtxoReferenceSize() : number {
        return 1;
    }

    public setTicketVotedUtxoReference(ref : TicketVotedUtxoReference) : void {
        this.ticketVoteUtxoRef = <TicketVotedUtxoReference>(ref.copyData());
    }
}