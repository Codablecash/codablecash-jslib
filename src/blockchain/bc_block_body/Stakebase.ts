import { ArrayList } from "../../db/base/ArrayList";
import { NullPointerException } from "../../db/base/NullPointerException";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { BalanceUnit } from "../bc_base/BalanceUnit";
import { AbstractUtxoReference } from "../bc_trx/AbstractUtxoReference";
import { BloomFilter1024 } from "../bc_wallet_filter/BloomFilter1024";


export class Stakebase extends AbstractUtxoReference {
    private amount : BalanceUnit;

    constructor(){
        super();
        this.amount = new BalanceUnit(0);
    }

    public getType(): number {
        return AbstractUtxoReference.UTXO_REF_TYPE_STAKEBASE;
    }

    public binarySize(): number {
        let total = 1; // sizeof(uint8_t);
        total += this.amount.binarySize();

        return total;
    }
    public toBinary(out: ByteBuffer): void {
        out.put(this.getType());
        this.amount.toBinary(out);
    }
    public fromBinary(input: ByteBuffer): void {
        let am = BalanceUnit.fromBinary(input);
        if(am != null){
            this.amount = am;
            return;
        }
        throw new NullPointerException("Coinbase.fromBinary()");
    }

    public getAmount() : BalanceUnit {
        return this.amount;
    }
    setAmount(amount : BalanceUnit) : void {
        this.amount = <BalanceUnit>(amount.copyData());
    }

    equals(other : Stakebase) : boolean {
        return this.amount.compareTo(other.amount) == 0;
    }

    public checkFilter(filtersList : ArrayList<BloomFilter1024>) : boolean {
        return false;
    }
}