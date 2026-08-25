import { Sha256 } from "../../base/crypto/Sha256";
import { NullPointerException } from "../../db/base/NullPointerException";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";
import { BalanceUnit } from "../bc_base/BalanceUnit";
import { AbstractBlockchainTransaction } from "../bc_trx/AbstractBlockchainTransaction";
import { AbstractUtxo } from "../bc_trx/AbstractUtxo";
import { AbstractUtxoReference } from "../bc_trx/AbstractUtxoReference";
import { TransactionId } from "../bc_trx/TransactionId";
import { AbstractBlockRewordTransaction } from "./AbstractBlockRewordTransaction";
import { Coinbase } from "./Coinbase";


export class CoinbaseTransaction extends AbstractBlockRewordTransaction {
    private coinbase :Coinbase | null;

    constructor(){
        super();
        this.coinbase = null;
    }

    public getType(): number {
        return AbstractBlockchainTransaction.TRX_TYPE_COIN_BASE;
    }

    public build(): void {
        this.setUtxoNonce();

        let capacity = this.binarySize();
        let buff = ByteBuffer.allocateWithEndian(capacity, true);

        this.toBinary(buff);
        buff.position(0);

        let sha = Sha256.sha256(buff.toUint8Array(), true);

        this.trxId = new TransactionId(sha.toUint8Array(), sha.limit());
    }

    public getFee(): BalanceUnit {
        return new BalanceUnit(0);
    }
    public getFeeRate(): BalanceUnit {
        return new BalanceUnit(0);
    }

    public getUtxoSize(): number {
        return super.getUtxoSize();
    }
    public getUtxo(i: number): AbstractUtxo {
        return super.getUtxo(i);
    }
    public getUtxoReferenceSize(): number {
        return super.getUtxoReferenceSize();
    }
    public getUtxoReference(i: number): AbstractUtxoReference {
        return super.getUtxoReference(i);
    }

    public binarySize(): number {
        if(this.coinbase != null){
            let total = this.__binarySize();
            total += this.coinbase.binarySize();

            return total;
        }
        throw new NullPointerException("CoinbaseTransaction.binarySize()");
    }
    public toBinary(out: ByteBuffer): void {
        if(this.coinbase != null){
            this.__toBinary(out);
            this.coinbase.toBinary(out);
            return;
        }
        throw new NullPointerException("CoinbaseTransaction.toBinary()");
    }
    public fromBinary(input: ByteBuffer): void {
        this.__fromBinary(input);

        let ref = AbstractUtxoReference.createFromBinary(input);
        this.coinbase = <Coinbase>(ref);
    }
}