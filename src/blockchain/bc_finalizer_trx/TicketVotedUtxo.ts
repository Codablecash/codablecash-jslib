import { isNumericLiteral } from "typescript";
import { NullPointerException } from "../../db/base/NullPointerException";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";
import { AddressDescriptor } from "../bc_base/AddressDescriptor";
import { BalanceUnit } from "../bc_base/BalanceUnit";
import { AbstractUtxo } from "../bc_trx/AbstractUtxo";
import { UtxoId } from "../bc_trx/UtxoId";
import { Sha256 } from "../../base/crypto/Sha256";

export class TicketVotedUtxo extends AbstractUtxo {
	private address : AddressDescriptor | null;
	private votedUtxoId : UtxoId | null;
	private amount : BalanceUnit;

    constructor() {
        super();
        this.address = null;
        this.votedUtxoId = null;
        this.amount = new BalanceUnit(0);
    }

    public getType() : number {
        return AbstractUtxo.TRX_UTXO_VOTED_TICKET;
    }

    public setVotedUtxoId(votedUtxoId : UtxoId) : void {
        this.votedUtxoId = <UtxoId>votedUtxoId.copyData();
    }

    public setAmount(amount : BalanceUnit) : void{
        this.amount = <BalanceUnit>amount.copyData();
    }

    public binarySize(): number {
        if(this.utxoId != null && this.address != null && this.votedUtxoId != null){
            let total = 1;

            total += this.address.binarySize();
            total += this.utxoId.binarySize();
            total += this.votedUtxoId.binarySize();
            total += this.amount.binarySize();

            return total;
        }
        throw new NullPointerException("TicketVotedUtxo.binarySize()");
    }
    public toBinary(out: ByteBuffer): void {
        if(this.utxoId != null && this.address != null && this.votedUtxoId != null){
            out.put(this.getType());

            this.address.toBinary(out);
            this.utxoId.toBinary(out);
            this.votedUtxoId.toBinary(out);
            this.amount.toBinary(out);
        }
        throw new NullPointerException("TicketVotedUtxo.toBinary()");
    }

    public fromBinary(input: ByteBuffer): void {
        this.address = AddressDescriptor.createFromBinary(input);
        this.utxoId = UtxoId.fromBinary(input);
        this.votedUtxoId = UtxoId.fromBinary(input);

        let unit = BalanceUnit.fromBinary(input);
        if(unit != null){
            this.amount = unit;
        }
    }

    public build(): void {
        if(this.address != null && this.votedUtxoId != null){
            let capacity = this.address.binarySize();
            capacity += this.votedUtxoId.binarySize();
            capacity += this.amount.binarySize();
            capacity += 32;

            let buff = ByteBuffer.allocateWithEndian(capacity, true);

            this.address.toBinary(buff);
            this.votedUtxoId.toBinary(buff);
            this.amount.toBinary(buff);
            buff.putArray(this.nonce, 0, 32);

            buff.position(0);

            let sha = Sha256.sha256(buff.toUint8Array(), true);

            this.utxoId = new UtxoId(sha.toUint8Array(), sha.limit());
            return;
        }
        throw new NullPointerException("TicketVotedUtxo.build()");
    }

    public copyData(): IBlockObject {
        if(this.utxoId != null && this.address != null && this.votedUtxoId != null){
            let inst = new TicketVotedUtxo();
            inst.nonce = this.nonce.slice(0, this.nonce.length);
            inst.utxoId = <UtxoId>this.utxoId.copyData();

            inst.address = <AddressDescriptor>this.address.copyData();
            inst.votedUtxoId = <UtxoId>this.votedUtxoId.copyData();
            inst.amount = <BalanceUnit>this.amount.copyData();

            return inst;
        }
        throw new NullPointerException("TicketVotedUtxo.copyData()");
    }

    public getAddress(): AddressDescriptor {
        if(this.address != null){
            return this.address;
        }
        throw new NullPointerException("TicketVotedUtxo.getAddress()");
    }
    public getAmount(): BalanceUnit {
        return this.amount;
    }

    public setAddress(desc : AddressDescriptor) {
        this.address = <AddressDescriptor>(desc.copyData());
    }
}