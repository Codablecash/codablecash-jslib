import { toBigIntBE, toBufferBE } from "bigint-buffer";
import { BufferOverflowException } from "./BufferOverflowException";
import { BigInteger } from "../numeric/BigInteger";
import bigInt from "big-integer";

const { Buffer } = require('node:buffer');

/**
 * Bytebuffer with Big Endian
 */
export class ByteBuffer {
    protected pos : number;
    protected lim : number;
    protected cap : number;
    protected data : Buffer;
    
    constructor(length : number){
        this.data =  Buffer.alloc(length, 0);
        this.cap = length;
        this.lim = length;
        this.pos = 0;
    }

    public static wrapWithEndian(data : Uint8Array, length : number, bigEngian : boolean) : ByteBuffer {
        const dataBuffer = Buffer.from(data);
        
        let inst = new ByteBuffer(length);
        inst.putBuffer(dataBuffer);
        inst.position(0);

        return inst;
    }

    public static allocateWithEndian(capacity : number, bigEndian : boolean) : ByteBuffer {
        let inst = new ByteBuffer(capacity);
         return inst;
    }

    public toUint8Array() : Uint8Array {
        let ar = new Uint8Array(this.cap);

        for(let i = 0; i != this.cap; ++i){
            let val = this.geti(i);
            ar[i] = val;
        }
        
        return ar;
    }

    public toString() : string {
        return this.data.toString();
    }

    public position(i : number) : void {
        this.pos = i;
    }
    public getPosition() {
        return this.pos;
    }

    public limit() : number {
        return this.lim;
    }

    public capacity() : number {
        return this.cap;
    }

    public get() : number {
        if(this.remaining() < 1){
            throw new BufferOverflowException("get()");
        }

        return this.data.readInt8(this.pos++);
    }

    public getByteBuffer(length : number) {
        if(this.remaining() < length){
            throw new BufferOverflowException("getByteBuffer()");
        }

        let buff = Buffer.allocate(length);

        this.data.copy(buff, 0, this.pos, this.pos + length);
        this.pos += length;

        let ret = new ByteBuffer(length);
        ret.putBuffer(buff);
        ret.position(0);

        return ret;
    }
    public geti(index : number) : number {
        if(index + 1 > this.lim){
            throw new BufferOverflowException("get()");
        }

        return this.data.readInt8(index);
    }
    public getShort() : number {
       if(this.remaining() < 2){
            throw new BufferOverflowException("getShort()");
        }

        let res = this.data.readInt16BE(this.pos);
        this.pos += 2;
        return res;
    }
    public getInt() : number {
       if(this.remaining() < 4){
            throw new BufferOverflowException("getInt()");
        }

        let res = this.data.readInt32BE(this.pos);
        this.pos += 4;
        return res;
    }
    public getLong() : bigint {
       if(this.remaining() < 4){
            throw new BufferOverflowException("getInt()");
        }

        let res = this.data.readBigInt64BE(this.pos);
        this.pos += 8;
        return res;
    }
    public toBigInteger() : BigInteger {
        let val = toBigIntBE(this.data);
        let ret = new BigInteger(val);
        return ret;
    }


    public put(data : number) : ByteBuffer {
        if(this.remaining() < 1){
            throw new BufferOverflowException("put(data : number)");
        }

        this.data.writeInt8(data, this.pos);
        this.pos++;
        return this;
    }
    public putBuffer(data : Buffer) : ByteBuffer {
        let dataLength = data.byteLength;
        if(this.remaining() < dataLength){
            throw new BufferOverflowException("putBuffer(data : Buffer)");
        }

        data.copy(this.data, this.pos, 0 , dataLength);
        this.pos += dataLength;

        return this;
    }
    public putByteBuffer(data : ByteBuffer) : ByteBuffer {
        this.putBuffer(data.data);
        return this;
    }

    public putArray(src : Uint8Array, off : number, len : number) {
        if (len > this.remaining()) {
            throw new BufferOverflowException("putArray()");
        }

        // Mem::memcpy(data->getRoot() + this->pos, src + off, len);
        let slice = src.slice(off, off + len);
        this.data.set(slice, this.pos);
        this.pos += len;

        return this;
    }

    public putShort(data : number) : ByteBuffer {
        if(this.remaining() < 1){
            throw new BufferOverflowException("put(data : number)");
        }

        this.data.writeInt16BE(data, this.pos);
        this.pos += 2;
        return this;
    }
    public putInt(data : number) : ByteBuffer {
        if(this.remaining() < 4){
            throw new BufferOverflowException("put(data : number)");
        }

        this.data.writeInt32BE(data, this.pos);
        this.pos += 4;
        return this;
    }
    public putLong(data : bigint | number) : ByteBuffer {
        if(this.remaining() < 8){
            throw new BufferOverflowException("putLong(data : number)");
        }

        let value : bigint;
        if(typeof data === "number"){
            value = BigInt(data);
        }else{
            value = data;
        }

        this.data.writeBigInt64BE(value, this.pos);
        this.pos += 8;
        return this;
    }
    public putUint8Array(src : Uint8Array, len : number) {
        if (len > this.remaining()) {
            throw new BufferOverflowException("put(src : Uint8Array, off : number, len : number)");
        }

        // Mem::memcpy(data.getRoot() + this.pos, src, len);
        let buff = src.slice(0, len);
        this.data.set(buff, this.pos);

        this.pos += len;

        return this;
    }

    public remaining() : number {
        return this.lim - this.pos;
    }

    public binaryEquals(buff : ByteBuffer) : boolean {
        let diff = this.data.compare(buff.data);

        let bl = (diff == 0) && this.cap == buff.cap;

        return bl;
    }

    public binaryCmp(buff: ByteBuffer) : number {
        let diff = this.data.compare(buff.data);

        return diff;
    }
}
