import { Sha256 } from "../../base/crypto/Sha256";
import { NullPointerException } from "../../db/base/NullPointerException";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";
import { AddressDescriptor } from "../bc_base/AddressDescriptor";
import { BalanceUnit } from "../bc_base/BalanceUnit";
import { NodeIdentifier } from "../bc_network/NodeIdentifier";
import { AbstractUtxo } from "../bc_trx/AbstractUtxo";
import { UtxoId } from "../bc_trx/UtxoId";

export class TicketUtxo extends AbstractUtxo {
    private nodeId : NodeIdentifier | null; // stake pool
    private addressDesc : AddressDescriptor | null; // registered ticket returned address
    private amount : BalanceUnit;

    constructor(){
        super();
        this.nodeId = null;
        this.amount = new BalanceUnit(0);
        this.addressDesc = null;
    }

    public getType() : number {
        return AbstractUtxo.TRX_UTXO_TICKET;
    }

    public build() : void {
        if(this.nodeId != null && this.addressDesc != null){
            let capacity = this.nodeId.binarySize();
            capacity += this.addressDesc.binarySize();
            capacity += this.amount.binarySize();
            capacity += 32;

            let buff = ByteBuffer.allocateWithEndian(capacity, true);

            this.nodeId.toBinary(buff);
            this.addressDesc.toBinary(buff);
            this.amount.toBinary(buff);
            buff.putArray(this.nonce, 0, 32);
            buff.position(0);

            let sha = Sha256.sha256(buff.toUint8Array(), true);

            this.utxoId = new UtxoId(sha.toUint8Array(), sha.limit());
            return;
        }
        throw new NullPointerException("TicketUtxo.build()");
    }

    public getAddress() : AddressDescriptor {
        if(this.addressDesc != null){
            return this.addressDesc;
        }
        throw new NullPointerException("TicketUtxo.getAddress()");
    }

    public binarySize(): number {
        if(this.nodeId != null && this.addressDesc != null && this.utxoId != null){
            let total = 1;

            total += this.utxoId.binarySize();

            total += this.nodeId.binarySize();
            total += this.addressDesc.binarySize();
            total += this.amount.binarySize();

            return total;
        }
        throw new NullPointerException("TicketUtxo.binarySize()");
    }
    public toBinary(out: ByteBuffer): void {
        if(this.nodeId != null && this.addressDesc != null && this.utxoId != null){
            out.put(this.getType());

            this.utxoId.toBinary(out);

            this.nodeId.toBinary(out);
            this.addressDesc.toBinary(out);
            this.amount.toBinary(out);
        }
        throw new NullPointerException("TicketUtxo.toBinary()");
    }
    public fromBinary(input: ByteBuffer): void {
        this.utxoId = UtxoId.fromBinary(input);

        this.nodeId = NodeIdentifier.fromBinary(input);

        this.addressDesc = AddressDescriptor.createFromBinary(input);

        let unit = BalanceUnit.fromBinary(input);
        if(unit != null){
            this.amount = unit;
        }
    }

    public copyData(): IBlockObject {
        if(this.nodeId != null && this.addressDesc != null && this.utxoId != null){
            let inst = new TicketUtxo();
            inst.nonce = this.nonce.slice(0, this.nonce.length);
            inst.utxoId = <UtxoId>this.utxoId.copyData();

            inst.nodeId = <NodeIdentifier>this.nodeId.copyData();
            inst.addressDesc = <AddressDescriptor>this.addressDesc.copyData();
            inst.amount = <BalanceUnit>this.amount.copyData();

            return inst;
        }
        throw new NullPointerException("TicketUtxo.copyData()");
    }

    public getAmount(): BalanceUnit {
        return this.amount;
    }

    public setNodeIndentifier(nodeId : NodeIdentifier) {
        this.nodeId = <NodeIdentifier>nodeId.copyData();
    }

    public setAddressDescriptor(addressDesc : AddressDescriptor) {
        this.addressDesc = <AddressDescriptor>addressDesc.copyData();
    }

    public setAmounst(amount : BalanceUnit) {
        this.amount = <BalanceUnit>amount.copyData();
    }
}