import { Sha256 } from "../../base/crypto/Sha256";
import { ArrayList } from "../../db/base/ArrayList";
import { NullPointerException } from "../../db/base/NullPointerException";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { SystemTimestamp } from "../../db/base_timestamp/SystemTimestamp";
import { BalanceUnit } from "../bc_base/BalanceUnit";
import { AbstractBalanceTransaction } from "../bc_trx/AbstractBalanceTransaction";
import { AbstractBlockchainTransaction } from "../bc_trx/AbstractBlockchainTransaction";
import { AbstractUtxo } from "../bc_trx/AbstractUtxo";
import { AbstractUtxoReference } from "../bc_trx/AbstractUtxoReference";
import { TransactionId } from "../bc_trx/TransactionId";
import { TransactionVersion } from "../bc_trx/TransactionVersion";
import { BalanceUtxo } from "../bc_trx_balance/BalanceUtxo";

export class GenesisTransaction extends AbstractBalanceTransaction {
    private list : ArrayList<BalanceUtxo>;

    constructor(){
        super();
        this.list = new ArrayList<BalanceUtxo>();
    }

	public getType() : number {
		return AbstractBlockchainTransaction.TRX_TYPE_GENESIS;
	}

    public addBalanceUtxo(utxo : BalanceUtxo) : void {
        let obj = <BalanceUtxo>(utxo.copyData());
        this.list.addElement(obj);
    }

	public getTotalBalance() : BalanceUnit {
        let unit = new BalanceUnit(0);

        let maxLoop = this.list.size();
        for(let i = 0; i != maxLoop; ++i){
            let utxo = this.list.get(i);

            if(utxo != null){ // guard
                let u = utxo.getAmount();
                unit = unit.addSelf(u);
            }
        }

        return unit;
    }

	public binarySize() : number {
        let total = 1; // sizeof(uint8_t);
        total += this.version.binarySize();
        total += this.timestamp.binarySize();

        total += 2; // sizeof(uint16_t);
        let maxLoop = this.list.size();
        for(let i = 0; i != maxLoop; ++i){
            let utxo = this.list.get(i);

            if(utxo != null){
                total += utxo.binarySize();
            }
        }

        return total;
    }
	public toBinary(out : ByteBuffer) : void {
        out.put(this.getType());
        this.version.toBinary(out);
        this.timestamp.toBinary(out);

        let maxLoop = this.list.size();
        out.putShort(maxLoop);

        for(let i = 0; i != maxLoop; ++i){
            let utxo = this.list.get(i);
            if(utxo != null){ // guard
                utxo.toBinary(out);
            }
        }
    }
	public fromBinary(input : ByteBuffer) : void {
        this.version = TransactionVersion.createFromBinary(input);
        this.timestamp = SystemTimestamp.fromBinary(input);

        let maxLoop = input.getShort();
        for(let i = 0; i != maxLoop; ++i){
            let utxo = AbstractUtxo.createFromBinary(input);

            this.addBalanceUtxo(<BalanceUtxo>(utxo));
        }
}

	public build() : void {
        this.setUtxoNonce();

        let cap = this.binarySize();
        let buff = ByteBuffer.allocateWithEndian(cap, true);

        this.toBinary(buff);
        buff.position(0);

        let sha = Sha256.sha256(buff.toUint8Array(), true);

        this.trxId = new TransactionId(sha.toUint8Array(), sha.limit());
    }

    public setUtxoNonce() : void {
        let capacity = 1 + this.version.binarySize() + this.timestamp.binarySize();
        let buff = ByteBuffer.allocateWithEndian(capacity, true);
        buff.put(this.getType());
        this.version.toBinary(buff);
        this.timestamp.toBinary(buff);

        let sha = Sha256.sha256(buff.toUint8Array(), true);
        let data = sha.toUint8Array();

        let maxLoop = this.list.size();
        for(let i = 0; i != maxLoop; ++i){
            let utxo = this.list.get(i);

            if(utxo != null){ // guard
                utxo.setNonce(data, i);
                utxo.build();
            }
        }
    }

	public getUtxoSize() : number {
		return this.list.size();
	}
	public getUtxo(i : number) : AbstractUtxo {
		let ret = this.list.get(i);
        if(ret != null){
            return ret;
        }
        throw new NullPointerException("GenesisTransaction.getUtxo()");
	}

	public getFeeRate() : BalanceUnit {
        return new BalanceUnit(0);
    }
	public getFee() : BalanceUnit {
        return new BalanceUnit(0);
    }

	public getUtxoReferenceSize() : number {
        return 0;
    }
	public getUtxoReference(i : number) : AbstractUtxoReference {
        throw new NullPointerException("GenesisTransaction.getUtxoReference()");
    }
    
}