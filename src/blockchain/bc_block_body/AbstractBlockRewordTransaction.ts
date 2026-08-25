import { Sha256 } from "../../base/crypto/Sha256";
import { ArrayList } from "../../db/base/ArrayList";
import { NullPointerException } from "../../db/base/NullPointerException";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { SystemTimestamp } from "../../db/base_timestamp/SystemTimestamp";
import { BalanceUnit } from "../bc_base/BalanceUnit";
import { AbstractBalanceTransaction } from "../bc_trx/AbstractBalanceTransaction";
import { AbstractUtxo } from "../bc_trx/AbstractUtxo";
import { AbstractUtxoReference } from "../bc_trx/AbstractUtxoReference";
import { TransactionVersion } from "../bc_trx/TransactionVersion";

export abstract class AbstractBlockRewordTransaction extends AbstractBalanceTransaction {
	private height : number;
	private inputlist : ArrayList<AbstractUtxoReference>;
	private list : ArrayList<AbstractUtxo>;

    constructor(){
        super();

        this.height = 0;
        this.inputlist = new ArrayList<AbstractUtxoReference>();
        this.list = new ArrayList<AbstractUtxo>();
    }

    public addUtxo(utxo : AbstractUtxo) : void {
        this.list.addElement(<AbstractUtxo>(utxo.copyData()));
    }

    public getUtxoSize() : number {
        return this.list.size();
    }

    public getUtxo(i : number) : AbstractUtxo{
        let utxo = this.list.get(i);
        if(utxo != null){
            return utxo;
        }
        throw new NullPointerException("AbstractBlockRewordTransaction.getUtxo()");
    }

    public getUtxoReferenceSize() : number {
        return this.inputlist.size();
    }

    public addInputUtxoRef(ref : AbstractUtxoReference) : void {
        this.inputlist.addElement(<AbstractUtxoReference>(ref.copyData()));
    }

    public getUtxoReference(i : number) : AbstractUtxoReference {
        let ref = this.inputlist.get(i);
        if(ref != null){
            return ref;
        }
        throw new NullPointerException("AbstractBlockRewordTransaction.getUtxoReference()");
    }

    protected setUtxoNonce() : void {
        //BinaryUtils::checkNotNull(this.timestamp);
        //BinaryUtils::checkNotNull(this.version);

        let capacity = 1 + this.version.binarySize() + this.timestamp.binarySize() + 8;
        {
            let maxLoop = this.getUtxoReferenceSize();
            for(let i = 0; i != maxLoop; ++i){
                let ref = this.getUtxoReference(i);

                capacity += ref.binarySize();
            }
        }

        let buff = ByteBuffer.allocateWithEndian(capacity, true);
        buff.put(this.getType());
        this.version.toBinary(buff);
        this.timestamp.toBinary(buff);
        buff.putLong(this.height);
        {
            let maxLoop = this.getUtxoReferenceSize();
            for(let i = 0; i != maxLoop; ++i){
                let ref = this.getUtxoReference(i);

                ref.toBinary(buff);
            }
        }

        let sha = Sha256.sha256(buff.toUint8Array(), true);
        let data = sha.toUint8Array();

        let maxLoop = this.getUtxoSize();
        for(let i = 0; i != maxLoop; ++i){
            let utxo = this.getUtxo(i);

            utxo.setNonce(data, i);

            utxo.build();
        }
    }

    protected __binarySize() : number {
        //BinaryUtils::checkNotNull(this.version);
        //BinaryUtils::checkNotNull(this.timestamp);

        let total = 1; //sizeof(uint8_t);
        total += this.version.binarySize();
        total += this.timestamp.binarySize();
        total += 8; //sizeof(this.height);

        {
            let maxLoop = this.inputlist.size();
            total += 1; // sizeof(uint8_t);

            for(let i = 0; i != maxLoop; ++i){
                let ref = this.inputlist.get(i);

                if(ref != null){ // guard
                    total += ref.binarySize();
                }
            }
        }

        {
            let maxLoop = this.list.size();
            total += 1; // sizeof(uint8_t);

            for(let i = 0; i != maxLoop; ++i){
                let utxo = this.list.get(i);
                if(utxo != null){ // guard
                    total += utxo.binarySize();
                }
            }
        }

        return total;
    }

    protected __toBinary(out : ByteBuffer) : void {
        out.put(this.getType());
        this.version.toBinary(out);
        this.timestamp.toBinary(out);
        out.putLong(this.height);

        {
            let maxLoop = this.inputlist.size();
            out.put(maxLoop);

            for(let i = 0; i != maxLoop; ++i){
                let ref = this.inputlist.get(i);
                if(ref != null){ // guard
                    ref.toBinary(out);
                }
            }
        }

        {
            let maxLoop = this.list.size();
            out.put(maxLoop);

            for(let i = 0; i != maxLoop; ++i){
                let utxo = this.list.get(i);
                if(utxo != null){
                    utxo.toBinary(out);
                }
            }
        }
    }

    public getFee() : BalanceUnit {
        return new BalanceUnit(0);
    }

    protected __fromBinary(input : ByteBuffer) : void {
        this.version = TransactionVersion.createFromBinary(input);

        this.timestamp = SystemTimestamp.fromBinary(input);
        this.height = Number(input.getLong());

        {
            let maxLoop = input.get();
            for(let i = 0; i != maxLoop; ++i){
                let ref = AbstractUtxoReference.createFromBinary(input);
                //BinaryUtils::checkNotNull(ref);

                this.inputlist.addElement(ref);
            }
        }

        {
            let maxLoop = input.get();
            for(let i = 0; i != maxLoop; ++i){
                let utxo = AbstractUtxo.createFromBinary(input);
                //BinaryUtils::checkNotNull(utxo);

                this.list.addElement(utxo);
            }
        }
    }
   
}