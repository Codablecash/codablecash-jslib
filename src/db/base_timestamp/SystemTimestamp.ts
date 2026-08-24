import { ByteBuffer } from "../base_io/ByteBuffer";

const microtime = require("microtime");

export class SystemTimestamp {
    protected sec : bigint;
	protected usec : number;

    constructor(sec? : bigint, usec? : number) {
        if(sec != undefined && usec != undefined){
            this.sec = sec;
            this.usec = usec;
        }
        else{
            let microtimeNow = microtime.now();
            this.sec = BigInt(Math.trunc(microtimeNow / 1000000));
            this.usec = microtimeNow & 1000000;
        }        
    }

    public binarySize() : number {
        let total = 8;
        total += 4;

        return total;
    }
    public toBinary(out : ByteBuffer) : void {
        out.putLong(this.sec);
        out.putInt(this.usec);
    }
    public static fromBinary(input : ByteBuffer) : SystemTimestamp {
        let sec = input.getLong();
        let usec = input.getInt();

        return new SystemTimestamp(sec, usec);
    }

	public getSec() : bigint {
		return this.sec;
	}
	public getUsec() : number {
		return this.usec;
	}

    public compareTo(other : SystemTimestamp) : number {
        let diff = this.sec - other.sec;
        if(diff != 0n){
            return diff > 0 ? 1 : -1;
        }

        return this.usec == other.usec ? 0 : (this.usec > other.usec ? 1 : -1);
    }

    public isZero() : boolean {
        return this.sec == 0n && this.usec == 0;
    }
}