import { toBufferBE } from "bigint-buffer";
import { ByteBuffer } from "../base_io/ByteBuffer";
import bigInt from "big-integer";


export class BigInteger {
    private value : bigint;

    constructor(val : bigint){
        this.value = BigInt(val);
         const hexString = this.value.toString(16);
    }

    public copy(){
        return new BigInteger(this.value);
    }

    public getValue() : bigint {
        return this.value;
    }

    public add(val : BigInteger) : BigInteger {
        let ans : bigint = this.value + val.value;
        return new BigInteger(ans);
    }
    public subtract(val : BigInteger) : BigInteger {
        let ans : bigint = this.value - val.value;
        return new BigInteger(ans);
    }
    public multiply(val : BigInteger) {
       let ans : bigint = this.value * val.value;
        return new BigInteger(ans);
    }
    public divide(val : BigInteger) : BigInteger {
        let ans : bigint = this.value / val.value;
        return new BigInteger(ans);
    }
    public pow(exp : bigint) : BigInteger {
        let ans = this.value ** exp;
        return new BigInteger(ans);
    }
    public modPow(exponent : BigInteger, mod : BigInteger) : BigInteger {
        if (mod.value === 1n){
            return new BigInteger(0n);
        }
        let res = 1n;
        let base = this.value % mod.value;
        let exp = exponent.value;

        while (exp > 0n) {
            if (exp % 2n === 1n){
                res = (res * base) % mod.value;
            }
            base = (base * base) % mod.value;
            exp = exp / 2n;
        }
        return new BigInteger(res);
    }
    public mod(mod : BigInteger) : BigInteger {
         let res = this.value % mod.value;
         return new BigInteger(res);
    }
    public modInverse(val : BigInteger) : BigInteger {
        let ans = bigInt(this.value).modInv(val.getValue());

        let str = ans.toString(10);
        const bigIntAgain: bigint = BigInt(str);

        return new BigInteger(bigIntAgain);
    }

    public compareTo(x : BigInteger) : number {
        return this.value === x.value ? 0 : (this.value > x.value ? 1 : -1);
    }

    public equals(x : BigInteger) : boolean {
        return this.compareTo(x) === 0;
    }

    public static ramdom() : BigInteger {
        const max = 10000000000000000n;
        const randomBigInt = BigInt(Math.floor(Math.random() * Number(max)));
        return new BigInteger(randomBigInt);
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