
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

    public put(data : number) : ByteBuffer {
        if(this.remaining() < 1){
            
        }

        this.data.writeInt8(data, this.pos);
        this.pos++;
        return this;
    }

    public remaining() : number {
        return this.lim - this.pos;
    }
  
}
