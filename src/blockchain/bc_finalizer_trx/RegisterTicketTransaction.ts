import { Sha256 } from "../../base/crypto/Sha256";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { AddressDescriptor } from "../bc_base/AddressDescriptor";
import { BalanceUnit } from "../bc_base/BalanceUnit";
import { NodeIdentifier } from "../bc_network/NodeIdentifier";
import { AbstractBlockchainTransaction } from "../bc_trx/AbstractBlockchainTransaction";
import { AbstractUtxo } from "../bc_trx/AbstractUtxo";
import { TransactionId } from "../bc_trx/TransactionId";
import { AbstractFinalizerTransaction } from "./AbstractFinalizerTransaction";
import { TicketUtxo } from "./TicketUtxo";

export class RegisterTicketTransaction extends AbstractFinalizerTransaction {
    private ticketUtxo : TicketUtxo;

    constructor(){
        super();
        this.ticketUtxo = new TicketUtxo();
    }

    public setNodeId(nodeId : NodeIdentifier) : void {
        this.ticketUtxo.setNodeIndentifier(nodeId);
    }

    public setAddressDescriptor(ticketReturnaddressDesc : AddressDescriptor) : void {
        this.ticketUtxo.setAddressDescriptor(ticketReturnaddressDesc);
    }

    public setAmounst(amount : BalanceUnit) : void {
        this.ticketUtxo.setAmounst(amount);
    }

    public getType() : number {
        return AbstractBlockchainTransaction.TRX_TYPE_REGISTER_TICKET;
    }

    public binarySize() : number {
        let total = super.binarySize();

        total += this.ticketUtxo.binarySize();

        return total;
    }

    public toBinary(out : ByteBuffer) : void {
        super.toBinary(out);

        this.ticketUtxo.toBinary(out);
    }

    public fromBinary(input : ByteBuffer) : void {
        super.fromBinary(input);

        let utxo = AbstractUtxo.createFromBinary(input);

        this.ticketUtxo = <TicketUtxo>(utxo);
    }

    public  build() : void {
        this.setUtxoNonce();

        let capacity = this.__binarySize();
        let buff = ByteBuffer.allocateWithEndian(capacity, true);

        this.__toBinary(buff);
        buff.position(0);

        let sha = Sha256.sha256(buff.toUint8Array(), true);

        this.trxId = new TransactionId(sha.toUint8Array(), sha.limit());
    }

    public getUtxoSize() : number {
        return super.getUtxoSize() + 1;
    }

    public  getUtxo(i : number) : AbstractUtxo {
        if(i == this.getUtxoSize()){
            return this.ticketUtxo;
        }

        return super.getUtxo(i);
    }

}