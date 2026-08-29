import { NullPointerException } from "../../db/base/NullPointerException";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";
import { BigInteger } from "../../db/numeric/BigInteger";

export abstract class Abstract32BytesId implements IBlockObject {
    public static Q : BigInteger = new BigInteger("ff66c4652cbb54e13e4cc75898014aef72332e147343a95031cf416ca9f77ce7", 16);
    public static G : BigInteger = new BigInteger("e000000000000000000000000000000000000000000000000000000000000002", 16);

    public id : ByteBuffer | null; // 32 bytes

    constructor(binary? : Uint8Array, length? : number) {
        if(binary != undefined && length != undefined){
            this.id = ByteBuffer.wrapWithEndian(binary, length, true);
        }
        else{
            this.id = null;
        }
    }

	public bufferIsNull() : boolean {
		return this.id == null;
	}
    
    public abstract copyData(): IBlockObject;

    public size() : number {
        if(this.id != null){ // guarad
            return this.id.limit();
        }
        throw new NullPointerException("Abstract32BytesId.size()");
    }

    public toArray() {
        if(this.id != null){ // guarad
            return this.id.toUint8Array();
        }
        throw new NullPointerException("Abstract32BytesId.toArray()");
    }

    public binarySize() : number {
        if(this.id != null){ // guarad
            let total = 4; // sizeof(int32_t);
            total += this.id.capacity();

            return total;
        }
        throw new NullPointerException("Abstract32BytesId.binarySize()");
    }

    public toBinary(out : ByteBuffer) : void {
        if(this.id != null){ // guarad
            let cap = this.id.capacity();
            out.putInt(cap);

            this.id.position(0);
            out.putByteBuffer(this.id);
        }
    }

    public equals(other : Abstract32BytesId) : boolean {
        if(this.id != null && other.id != null){ // guarad
            return this.id.binaryEquals(other.id);
        }
        throw new NullPointerException("Abstract32BytesId.equals()");
    }

    public compareTo(other : Abstract32BytesId) : number {
        if(this.id != null && other.id != null){ // guarad
            return this.id.binaryCmp(other.id);
        }
        throw new NullPointerException("Abstract32BytesId.compareTo()");
    }

    public toBigInteger() : BigInteger {
        if(this.id != null){ // guarad
            let ret = BigInteger.fromBinary(this.id);
            return ret;
        }
        throw new NullPointerException("Abstract32BytesId.toBigInteger()");
    }

    public toString() : string {
        if(this.id != null){ // guarad
            let bigInt = this.toBigInteger();

            let str = bigInt.toString(16);
            return str;
        }
        throw new NullPointerException("Abstract32BytesId.toString()");
    }

    public hashCode() : number {
        if(this.id != null){ // guarad
            this.id.position(0);
            let bint = BigInteger.fromBinary(this.id);
            let hash = bint.toNumber();
            return hash;
        }
        throw new NullPointerException("Abstract32BytesId.hashCode()");
    }

    public static makeRandom16Bytes() : ByteBuffer {
        let size = 0;
        let p = new BigInteger("0");
        do{
            let sbint = BigInteger.getRandomBigInt(256);

            let seed = new BigInteger(sbint);

            let s = seed.mod(Abstract32BytesId.Q);
            p = Abstract32BytesId.G.modPow(s, Abstract32BytesId.Q);
            size = p.binarySize();
        } while(size != 32);

        let buff = p.toBinary();
        buff.position(0);

        return buff;
    }
}
