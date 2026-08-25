import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";
import { BalanceUnit } from "../bc_base/BalanceUnit";
import { AbstractBlockchainTransaction } from "../bc_trx/AbstractBlockchainTransaction";
import { AbstractUtxo } from "../bc_trx/AbstractUtxo";
import { AbstractUtxoReference } from "../bc_trx/AbstractUtxoReference";
import { AbstractBlockRewordTransaction } from "./AbstractBlockRewordTransaction";


export class CoinbaseTransaction extends AbstractBlockRewordTransaction {

    public getType(): number {
        return AbstractBlockchainTransaction.TRX_TYPE_COIN_BASE;
    }
    public build(): void {
        throw new Error("Method not implemented.");
    }
    public getFee(): BalanceUnit {
        throw new Error("Method not implemented.");
    }
    public getFeeRate(): BalanceUnit {
        throw new Error("Method not implemented.");
    }
    public getUtxoSize(): number {
        throw new Error("Method not implemented.");
    }
    public getUtxo(i: number): AbstractUtxo {
        throw new Error("Method not implemented.");
    }
    public getUtxoReferenceSize(): number {
        throw new Error("Method not implemented.");
    }
    public getUtxoReference(i: number): AbstractUtxoReference {
        throw new Error("Method not implemented.");
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
}