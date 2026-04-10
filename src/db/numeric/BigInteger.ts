import { toBufferBE } from "bigint-buffer";
import { ByteBuffer } from "../base_io/ByteBuffer";
import bigInt from "big-integer";


export class BigInteger {
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

    public add(val : BigInteger) : BigInteger {
        let ans = this.value.add(val.value);
        return new BigInteger(ans);
    }
    public subtract(val : BigInteger) : BigInteger {
        let ans = this.value.subtract(val.value);
        return new BigInteger(ans);
    }
    public multiply(val : BigInteger) {
        let ans = this.value.multiply(val.value);
        return new BigInteger(ans);
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
        return new BigInteger(ans);
    }
    public mod(mod : BigInteger) : BigInteger {
        let res = this.value.mod(mod.value);
        if(res.isNegative()){
            res = res.add(mod.value);
        }

        return new BigInteger(res);
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