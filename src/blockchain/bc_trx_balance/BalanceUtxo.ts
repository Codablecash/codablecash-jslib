import { Sha256 } from "../../base/crypto/Sha256";
import { NullPointerException } from "../../db/base/NullPointerException";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";
import { AddressDescriptor } from "../bc_base/AddressDescriptor";
import { BalanceUnit } from "../bc_base/BalanceUnit";
import { AbstractUtxo } from "../bc_trx/AbstractUtxo";
import { UtxoId } from "../bc_trx/UtxoId";
import { FeeShortageException } from "./FeeShortageException";


export class BalanceUtxo extends AbstractUtxo {
	protected addressDesc : AddressDescriptor | null;
	protected amount : BalanceUnit;

    constructor(amount? : BalanceUnit){
        super();
        this.addressDesc = null;

        if(amount != undefined){
            this.amount = <BalanceUnit>amount.copyData();
        }else{
            this.amount = new BalanceUnit(0);
        }
    }

    public getType(): number {
        return AbstractUtxo.TRX_UTXO_BALANCE;
    }

    public setAddress(desc : AddressDescriptor) : void {
        this.addressDesc = <AddressDescriptor>desc.copyData();
    }

    public binarySize(): number {
        if(this.utxoId != null && this.addressDesc != null){
            let total = 1;

            total += this.utxoId.binarySize();

            total += this.addressDesc.binarySize();
            total += this.amount.binarySize();

            return total;
        }
        throw new NullPointerException("BalanceUtxo.binarySize()");
    }
    public toBinary(out: ByteBuffer): void {
        if(this.utxoId != null && this.addressDesc != null){
            out.put(this.getType());

            this.utxoId.toBinary(out);

            this.addressDesc.toBinary(out);
            this.amount.toBinary(out);
        }
        throw new NullPointerException("BalanceUtxo.toBinary()");
    }
    public fromBinary(input: ByteBuffer): void {
        this.utxoId = UtxoId.fromBinary(input);

        this.addressDesc = AddressDescriptor.createFromBinary(input);

        let unit = BalanceUnit.fromBinary(input);
        if(unit != null){
            this.amount = unit;
        }else{
            throw new NullPointerException("BalanceUtxo.fromBinary()");
        }
    }

    public copyData(): IBlockObject {
        if(this.addressDesc != null){
            let inst = new BalanceUtxo(this.amount);
            inst.setAddress(this.addressDesc);
            return inst;
        }
        throw new NullPointerException("BalanceUtxo.copyData()");
    }

    public getAddress(): AddressDescriptor {
        throw this.addressDesc;
    }
    public getAmount(): BalanceUnit {
        return this.amount;
    }

    public build() : void {
        if(this.addressDesc != null){
            let capacity = this.addressDesc.binarySize();
            capacity += this.amount.binarySize();
            capacity += 32; // nonce

            let buff = ByteBuffer.allocateWithEndian(capacity, true);

            this.addressDesc.toBinary(buff);
            this.amount.toBinary(buff);
            buff.putArray(this.nonce, 0, 32);
            buff.position(0);

            let sha = Sha256.sha256(buff.toUint8Array(), true);

            this.utxoId = new UtxoId(sha.toUint8Array(), sha.limit());
            return;
        }
        throw new NullPointerException("BalanceUtxo.build()");
    }

    public discountFee(feeRemain : BalanceUnit) {
        if(this.amount.compareTo(feeRemain) < 0){
            throw new FeeShortageException("at discountFee()");
        }

        this.amount.subSelf(feeRemain);
    }
}