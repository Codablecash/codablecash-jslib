import { Sha256 } from "../../base/crypto/Sha256";
import { BalanceUnit } from "../../blockchain/bc_base/BalanceUnit";
import { AbstractBalanceTransaction } from "../../blockchain/bc_trx/AbstractBalanceTransaction";
import { AbstractBlockchainTransaction } from "../../blockchain/bc_trx/AbstractBlockchainTransaction";
import { AbstractUtxo } from "../../blockchain/bc_trx/AbstractUtxo";
import { AbstractUtxoReference } from "../../blockchain/bc_trx/AbstractUtxoReference";
import { TransactionId } from "../../blockchain/bc_trx/TransactionId";
import { ArrayList } from "../../db/base/ArrayList";
import { NullPointerException } from "../../db/base/NullPointerException";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { SystemTimestamp } from "../../db/base_timestamp/SystemTimestamp";
import { AbstractSmartcontractTransaction } from "./AbstractSmartcontractTransaction";

export class NopSmartcontractTransaction extends AbstractSmartcontractTransaction {
    private static serial = 1;
	
    private nonce : number;
	private utxoList : ArrayList<AbstractUtxo>;

    constructor(){
        super();
        this.nonce = NopSmartcontractTransaction.serial++;
        this.utxoList = new ArrayList<AbstractUtxo>();
    }

    public getType() : number {
        return AbstractBlockchainTransaction.TRX_TYPE_SMARTCONTRACT_NOP;
    }

    public binarySize(): number {
        let total = 1; // sizeof(uint8_t);

        total += this.timestamp.binarySize();
        total += 8; // sizeof(this.nonce);

        let maxLoop = this.utxoList.size();
        total += 2; // sizeof(uint16_t);

        for(let i = 0; i != maxLoop; ++i){
            let utxo = this.utxoList.get(i);
            if(utxo != null){ // guard
                total += utxo.binarySize();
            }
        }

        return total;
    }
    public toBinary(out: ByteBuffer): void {
        out.put(this.getType());

        this.timestamp.toBinary(out);
        out.putLong(this.nonce);

        let maxLoop = this.utxoList.size();
        out.putShort(maxLoop);

        for(let i = 0; i != maxLoop; ++i){
            let utxo = this.utxoList.get(i);
            if(utxo != null){ // guard
                utxo.toBinary(out);
            }
        }
    }
    public fromBinary(input: ByteBuffer): void {
        this.timestamp = SystemTimestamp.fromBinary(input);
        this.nonce = Number(input.getLong());

        let maxLoop = input.getShort();
        for(let i = 0; i != maxLoop; ++i){
            let utxo = AbstractUtxo.createFromBinary(input);

            this.utxoList.addElement(utxo);
        }
    }

    public build(): void {
        this.setUtxoNonce();

        let capacity = 1 + this.version.binarySize() + this.timestamp.binarySize() + 8;

        let buff = ByteBuffer.allocateWithEndian(capacity, true);
        buff.put(this.getType());

        this.version.toBinary(buff);
        this.timestamp.toBinary(buff);
        buff.putLong(this.nonce);

        buff.position(0);

        let sha = Sha256.sha256(buff.toUint8Array(), true);

        this.trxId = new TransactionId(sha.toUint8Array(), sha.limit());
    }

    private setUtxoNonce() : void {
        let capacity = 1 + this.version.binarySize() + this.timestamp.binarySize();

        let buff = ByteBuffer.allocateWithEndian(capacity, true);
        buff.put(this.getType());
        this.version.toBinary(buff);
        this.timestamp.toBinary(buff);


        let sha = Sha256.sha256(buff.toUint8Array(), true);
        let data = sha.toUint8Array();

        let maxLoop = this.utxoList.size();
        for(let i = 0; i != maxLoop; ++i){
            let utxo = this.utxoList.get(i);

            if(utxo != null){
                utxo.setNonce(data, i);
                utxo.build();
            }
        }
    }

    public getFee(): BalanceUnit {
        return new BalanceUnit(0);
    }
    public getFeeRate(): BalanceUnit {
        return new BalanceUnit(0);
    }
    public getUtxoSize(): number {
        return this.utxoList.size();
    }
    public getUtxo(i: number): AbstractUtxo {
        let utxo = this.utxoList.get(i);
        if(utxo != null){
            return utxo;
        }
        throw new NullPointerException("NopSmartcontractTransaction.getUtxo()");
    }
    public getUtxoReferenceSize(): number {
        return 0
    }
    public getUtxoReference(i: number): AbstractUtxoReference {
        throw new Error("Method not implemented.");
    }

}