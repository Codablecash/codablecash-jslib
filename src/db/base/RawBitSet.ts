

class BitsetArray {
    public length : number;
	private buff : Uint32Array;

    constructor(numBits : number) {
        this.length = numBits;
        this.buff = new Uint32Array(numBits);
        this.buff.fill(0);
    }

    public set(value : number, index : number) {
        this.buff[index] = value;
    }

    public growLength(len : number) {
        let tmp = new Uint32Array(len);
        tmp.fill(0);

        //Mem::memcpy(tmp, buff, length * sizeof(uint64_t));
        tmp.set(this.buff, 0);

        this.length = len;
        
        this.buff = tmp;
    }

    public get(pos : number) {
        return this.buff[pos];
    }
}


export class RawBitSet {
    public static readonly OFFSET : number = 6;
    public static readonly ELM_SIZE : number = 1 << RawBitSet.OFFSET;
    public static readonly RIGHT_BITS : number = RawBitSet.ELM_SIZE - 1;
    public static readonly TWO_N_ARRAY : number[]
        = [0x1, 0x2, 0x4, 0x8, 0x10, 0x20, 0x40, 0x80, 0x100, 0x200, 0x400, 0x800, 0x1000, 0x2000, 0x4000, 0x8000, 0x10000, 0x20000, 0x40000, 0x80000, 0x100000, 0x200000, 0x400000, 0x800000, 0x1000000, 0x2000000, 0x4000000, 0x8000000, 0x10000000, 0x20000000, 0x40000000, 0x80000000, 0x100000000, 0x200000000, 0x400000000, 0x800000000, 0x1000000000, 0x2000000000, 0x4000000000, 0x8000000000, 0x10000000000, 0x20000000000, 0x40000000000, 0x80000000000, 0x100000000000, 0x200000000000, 0x400000000000, 0x800000000000, 0x1000000000000, 0x2000000000000, 0x4000000000000, 0x8000000000000, 0x10000000000000, 0x20000000000000, 0x40000000000000, 0x80000000000000, 0x100000000000000, 0x200000000000000, 0x400000000000000, 0x800000000000000, 0x1000000000000000, 0x2000000000000000, 0x4000000000000000, 0x8000000000000000];

	private bits : BitsetArray;
	private _needClear : boolean;
	private actualArrayLength : number;
	private isLengthActual : boolean;

    constructor(nbits : number) {
        this.bits = new BitsetArray( ((nbits >> RawBitSet.OFFSET) + (((nbits & RawBitSet.RIGHT_BITS) > 0) ? 1 : 0)));
        this._needClear = false;
        this.actualArrayLength = 0;
        this.isLengthActual = true;       
    }

    public set(pos : number) {
        let len = (pos >> RawBitSet.OFFSET) + 1;
        if(len > this.bits.length)
        {
            this.bits.growLength(len);
        }
        this.bits.set(this.bits.get(len - 1) | (RawBitSet.TWO_N_ARRAY[pos & RawBitSet.RIGHT_BITS]), len - 1);
        if(len > this.actualArrayLength)
        {
            this.actualArrayLength = len;
            this.isLengthActual = true;
        }
        this.needClear();
    }

    public clear(pos? : number) {
        if(pos == undefined){
            this.__clear();
            return;
        }

        if(!this._needClear) {
            return ;
        }
        let arrayPos = pos >> RawBitSet.OFFSET;
        if(arrayPos < this.actualArrayLength)
        {
            this.bits.set(this.bits.get(arrayPos) & (~(RawBitSet.TWO_N_ARRAY[pos & RawBitSet.RIGHT_BITS])), arrayPos);
            if(this.bits.get(this.actualArrayLength - 1) == 0) {
                this.isLengthActual = false;
            }
        }
    }

    public __clear() {
        if(this._needClear){

            for(let i = 0; i < this.bits.length; i ++ )
            {
                this.bits.set(0, i);
            }
            this.actualArrayLength = 0;
            this.isLengthActual = true;
            this._needClear = false;
        }
    }

    public needClear() {
        this._needClear = true;
    }

    public nextSetBit(pos : number) {
        if(pos >= this.actualArrayLength << RawBitSet.OFFSET)
        {
            return -1;
        }
        let idx = pos >> RawBitSet.OFFSET;
        if(this.bits.get(idx) != 0) {
            for(let j = pos & RawBitSet.RIGHT_BITS; j < RawBitSet.ELM_SIZE; j ++ ) {
                let left = (this.bits).get(idx);
                let right = (RawBitSet.TWO_N_ARRAY[j]);


                if(((this.bits).get(idx) & (RawBitSet.TWO_N_ARRAY[j])) != 0){
                    return (idx << RawBitSet.OFFSET) + j;
                }
            }
        }
        idx ++ ;
        while(idx < this.actualArrayLength && this.bits.get(idx) == 0) {
            idx ++ ;
        }
        if(idx == this.actualArrayLength) {
            return -1;
        }

        let ret = -1;
        for(let j = 0; j < RawBitSet.ELM_SIZE; j ++ ) {
            if(((this.bits.get(idx) & (RawBitSet.TWO_N_ARRAY[j])) != 0)) {
                ret = (idx << RawBitSet.OFFSET) + j;
                break;
            }
        }

        return ret;
    }
}