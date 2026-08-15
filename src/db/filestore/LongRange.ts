import { MinusToken } from "typescript";
import { ByteBuffer } from "../base_io/ByteBuffer";


export class LongRange {
    private min : number;
    private max : number;

    constructor(min : number, max : number) {
        this.min = min;
        this.max = max;
    }

    public getMin() : number {
        return this.min;
    }
    public getMax() : number {
        return this.max;
    }
    public setMin(value : number) : void {
        this.min = value;
    }
    public setMax(value : number) : void {
        this.max = value;
    }

    public compare(value : number) : number {
        if(this.min <= value && value <= this.max){
            return 0;
        }

        if(this.min > value){
            return 1;
        }
        return -1;
    }

    public removeLow(value : number) : boolean {
        this.min = value + 1;
        return !(this.min <= this.max);       
    }

    public removeHigh(value : number) : boolean {
        this.max = value - 1;
        return !(this.min <= this.max);       
    }

    public binarySize() : number {
        return 8 + 8;
    }

    public toBinary(buff : ByteBuffer) : void {
        buff.putLong(this.min);
        buff.putLong(this.max);       
    }

    public static fromBinary(buff : ByteBuffer) : LongRange {
        let min = buff.getLong();
        let max = buff.getLong();

        return new LongRange(Number(min), Number(max));
    }

    public equals(other : LongRange) {
        return this.min == other.min && this.max == other.max;
    }

    public width() : number {
    	return this.max - this.min + 1;
    }
}