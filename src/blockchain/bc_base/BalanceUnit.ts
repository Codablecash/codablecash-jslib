import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";

export class BalanceUnit implements IBlockObject {
    public static TYPE_PERICA = 1; 

	public type : number;
	public amount : number;

    constructor(amount? : number) {
        this.type = BalanceUnit.TYPE_PERICA;
        this.amount = 0;
        if(amount != undefined){
            this.amount = amount;
        }
    }

	public getType() : number {
		return BalanceUnit.TYPE_PERICA;
	}

    public getAmount() : number {
        return this.amount;
    }
    public setAmount(amount: number) : void{
        this.amount = amount;
    }
    
    binarySize(): number {
        return 1 + 8;
    }
    toBinary(out: ByteBuffer): void {
        out.put(this.getType());
        out.putLong(this.amount);
    }
    public static fromBinary(input : ByteBuffer) {
        let ret = null;
        let type = input.get();

        if(type == BalanceUnit.TYPE_PERICA){
            ret = new BalanceUnit();
            ret.importBinary(input);
        }

        return ret;        
    }
    public importBinary(input : ByteBuffer) {
        this.amount = Number(input.getLong());
    }

    public copyData(): IBlockObject {
        return new BalanceUnit(this.amount);
    }

    public compareTo(other : BalanceUnit) : number {
        return this.amount == other.amount ? 0 : ( this.amount > other.amount ? 1 : -1);
    }

    public subSelf(val : BalanceUnit) : BalanceUnit {
        this.amount -= val.amount;
        return this;
    }

    public addSelf(val : BalanceUnit) : BalanceUnit {
        this.amount += val.amount;
        return this; 
    }
}