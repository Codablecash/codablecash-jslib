import { ByteBuffer } from "../../db/base_io/ByteBuffer";


export class BloomHash1024 {
    public static FILTER8 : number = 0xFF;
	public static NUM_EXTRA_BITS : number  = 5;
	public static FILTER2 : number  = 0x1F;

    private values : Uint8Array;
    private flag : number;

    constructor(v0 : number, v1 : number, v2 : number, flag? : number){
        this.values = new Uint8Array(3);
        this.values[0] = v0;
        this.values[1] = v1;
        this.values[2] = v2;

        this.flag = 0;
        if(flag != undefined){
            this.flag = flag;
        }
        else {
            this.setBits(v0, 0);
            this.setBits(v1, 1);
            this.setBits(v2, 2);       
        }
    }

    private setBits(base : number, pos : number) : void {
        let val = base >> 8;
        val = val << (pos * BloomHash1024.NUM_EXTRA_BITS);

        let mask = ~(BloomHash1024.FILTER2 << (pos * BloomHash1024.NUM_EXTRA_BITS));

        // clear flag
        this.flag = this.flag & mask;

        // set value
        this.flag = this.flag | val;
    }

    private getUpperBits(pos : number) : number {
        let val = this.flag >> (pos * BloomHash1024.NUM_EXTRA_BITS);

        val = val & BloomHash1024.FILTER2;
        return val << 8;
    }

    public getValue(pos : number) {
        let value = this.values[pos];

        let upper = this.getUpperBits(pos);

        return value | upper;
    }

    public binarySize() : number {
        return 1 * 3 + 2;
    }

    public toBinary(out : ByteBuffer) {
        out.put(this.values[0]);
        out.put(this.values[1]);
        out.put(this.values[2]);

        out.putShort(this.flag);
    }

    public static createFromBinary(input : ByteBuffer) : BloomHash1024 {
        let v0 = input.get();
        let v1 = input.get();
        let v2 = input.get();
        let flag = input.getShort();

        return new BloomHash1024(v0, v1, v2, flag);
    }

    public equals(other : BloomHash1024) : boolean {
        return this.values[0] == other.values[0] &&
                this.values[1] == other.values[1] &&
                this.values[2] == other.values[2] &&
                this.flag == other.flag;
    }

    public copyData() : BloomHash1024 {
        return new BloomHash1024(this.values[0], this.values[1], this.values[2], this.flag);
    }
}