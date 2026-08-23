import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";
import { AddressDescriptor } from "../bc_base/AddressDescriptor";
import { BalanceUnit } from "../bc_base/BalanceUnit";
import { AbstractUtxo } from "../bc_trx/AbstractUtxo";


class BalanceUtxo extends AbstractUtxo {
	private addressDesc : AddressDescriptor | null;
	private amount : BalanceUnit;

    constructor(amount : BalanceUnit){
        super();
        this.addressDesc = null;
        
    }

    public getType(): number {
        throw new Error("Method not implemented.");
    }
    public fromBinary(input: ByteBuffer): void {
        throw new Error("Method not implemented.");
    }
    public build(): void {
        throw new Error("Method not implemented.");
    }
    public binarySize(): number {
        throw new Error("Method not implemented.");
    }
    public toBinary(out: ByteBuffer): void {
        throw new Error("Method not implemented.");
    }
    public copyData(): IBlockObject {
        throw new Error("Method not implemented.");
    }
    public getAddress(): AddressDescriptor {
        throw new Error("Method not implemented.");
    }
    public getAmount(): BalanceUnit {
        throw new Error("Method not implemented.");
    }

}