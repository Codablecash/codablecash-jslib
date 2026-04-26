import { toBufferBE } from "bigint-buffer";
import { ByteBuffer } from "../base_io/ByteBuffer";
import bigInt from "big-integer";


export class BigInteger {
    public static readonly ZERO : BigInteger = new BigInteger(0n);
     public static readonly ONE : BigInteger = new BigInteger(1n);
    public static readonly TWO : BigInteger = new BigInteger(2n);

    private value : bigInt.BigInteger;

    constructor(val : string);
    constructor(val : bigint);
    constructor(val : bigInt.BigInteger);
    constructor(val : any){
         this.value = bigInt(val);
    }

    public copy(){
        const hexString = this.value.toString(10);

        return new BigInteger(hexString);
    }

    public getValue() : bigint {
        const hexString = this.value.toString(10);

        return BigInt(hexString);
    }

    public toString(radix = 10) : string {
        const val : bigint = this.getValue();
        return val.toString(radix);
    }

    public add(val : BigInteger) : BigInteger {
        let ans = this.value.add(val.value);
        return new BigInteger(ans);
    }
    public addSelf(val : BigInteger) : BigInteger {
        this.value = this.value.add(val.value);
        return this;
    }

    public subtract(val : BigInteger) : BigInteger {
        let ans = this.value.subtract(val.value);
        return new BigInteger(ans);
    }
    public subtractSelf(val : BigInteger) : BigInteger {
        this.value = this.value.subtract(val.value);
        return this;
    }

    public multiply(val : BigInteger) : BigInteger {
        let ans = this.value.multiply(val.value);
        return new BigInteger(ans);
    }
    public multiplySelf(val : BigInteger) {
        this.value = this.value.multiply(val.value);
        return this;
    }

    public divide(val : BigInteger) : BigInteger {
        let ans = this.value.divide(val.value);
        return new BigInteger(ans);
    }
    public pow(exp : bigint) : BigInteger {
        let bexp = bigInt(exp);
        let ans = this.value.pow(bexp);
        return new BigInteger(ans);
    }
    public modPow(exponent : BigInteger, mod : BigInteger) : BigInteger {
        let ans = this.value.modPow(exponent.value, mod.value);
        if(ans.isNegative()){
            ans = ans.add(mod.value);
        }

        return new BigInteger(ans);
    }
    public mod(mod : BigInteger) : BigInteger {
        let res = this.value.mod(mod.value);
        if(res.isNegative()){
            res = res.add(mod.value);
        }

        return new BigInteger(res);
    }

    public modSelf(mod : BigInteger) : BigInteger {
        this.value = this.value.mod(mod.value);
        if(this.value.isNegative()){
            this.value = this.value.add(mod.value);
        }

        return this;
    }

    public modInverse(val : BigInteger) : BigInteger {
        let ans = this.value.modInv(val.value);
        return new BigInteger(ans);
    }

    public negate() : BigInteger {
        let neg : bigInt.BigInteger = this.value.negate();
        return new BigInteger(neg);
    }

    public compareTo(x : BigInteger) : number {
        return this.value.compareTo(x.value);
    }

    public shiftRight(n : number) : BigInteger {
        let ans = this.value.shiftRight(n);
        return new BigInteger(ans);
    }

    public toNumber() : number {
        return this.value.toJSNumber();
    }

    public equals(x : BigInteger) : boolean {
        return this.compareTo(x) === 0;
    }

    public static ramdom(min = new BigInteger(0n), max = new BigInteger(100000000000000000n)) : BigInteger {
        const range = max.getValue() - min.getValue() + 1n;
        const bits = range.toString(2).length;
        let randomValue: bigint;

        do {
            randomValue = BigInteger.getRandomBigInt(bits);
        } while (randomValue >= range);

        return new BigInteger(min.getValue() + randomValue);
    }

    public static getRandomBigInt(bits: number) : bigint {
        const bytes = Math.ceil(bits / 8);
        const buffer = new Uint8Array(bytes);
        crypto.getRandomValues(buffer);

         let result = 0n;
         for (let i = 0; i < bytes; i++) {
            result = (result << 8n) | BigInt(buffer[i]);
         }
         return result & ((1n << BigInt(bits)) - 1n);
    }

    public binarySize() : number {
        const hexString = this.value.toString(16);
        const buffer = Buffer.from(hexString.padStart(hexString.length + (hexString.length % 2), '0'), 'hex');

        let length : number = buffer.byteLength;

        return length;
    }

    public toBinary() : ByteBuffer {
        const hexString = this.value.toString(16);

        const buffer = Buffer.from(hexString.padStart(hexString.length + (hexString.length % 2), '0'), 'hex');

        let length : number = buffer.byteLength;

        let bytes = new ByteBuffer(length);
        bytes.putBuffer(buffer);

        return bytes;
    }

    public static fromBinary(indata : ByteBuffer) {
        return indata.toBigInteger();
    }
    public static padBuffer(bin : ByteBuffer, size : number) : ByteBuffer {
        bin.position(0);
        let len = bin.limit();

        let pad : number = size - len;
        let buff = new ByteBuffer(size);

        for(let i = 0; i != pad; ++i){
            buff.put(0);
        }

        buff.putByteBuffer(bin);

        return buff;
    }

}