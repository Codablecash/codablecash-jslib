import { toBigIntBE, toBufferBE } from "bigint-buffer";
import { BufferOverflowException } from "./BufferOverflowException";
import { BigInteger } from "../numeric/BigInteger";

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
        this.data =  Buffer.allocate(length);
        this.cap = length;
        this.lim = length;
        this.pos = 0;
    }

    public get() : number {
        if(this.remaining() < 1){
            throw new BufferOverflowException("get()");
        }

        return this.data.readInt8(this.pos++);
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

        return this.data.readInt16BE(this.pos++);
    }
    public getInt() : number {
       if(this.remaining() < 4){
            throw new BufferOverflowException("getInt()");
        }

        return this.data.readInt32BE(this.pos++);
    }
    public getLong() : bigint {
       if(this.remaining() < 4){
            throw new BufferOverflowException("getInt()");
        }

        return this.data.readBigInt64BE(this.pos++);
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

        this.data.copy(data, this.pos);
        this.pos += dataLength;

        return this;
    }

    public putShort(data : number) : ByteBuffer {
        if(this.remaining() < 1){
            throw new BufferOverflowException("put(data : number)");
        }

        this.data.writeInt16BE(data, this.pos);
        this.pos++;
        return this;
    }
    public putInt(data : number) : ByteBuffer {
        if(this.remaining() < 4){
            throw new BufferOverflowException("put(data : number)");
        }

        this.data.writeInt32BE(data, this.pos++);
        return this;
    }
    public putLong(data : bigint) : ByteBuffer {
        if(this.remaining() < 8){
            throw new BufferOverflowException("putLong(data : number)");
        }

        this.data.writeBigInt64BE(data, this.pos++);
        return this;
    }
    public remaining() : number {
        return this.lim - this.pos;
    }
  
}
