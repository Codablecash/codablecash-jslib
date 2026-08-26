import { IBlockObject } from "../../db/filestore_block/IBlockObject";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";

export class MerkleCertificateElement implements IBlockObject {
	private hash : ByteBuffer;
	private left : boolean;

    constructor(hash : ByteBuffer, left : boolean){
        this.hash = hash.clone();
        this.left = left;
    }
    
	public isLeft() : boolean {
		return this.left;
	}
	public getHash() : ByteBuffer {
		return this.hash;
	}

    public binarySize() : number {
        let total = 1 + this.hash.limit();
        total += 1; // sizeof(uint8_t);

        return total;
    }

    public toBinary(out : ByteBuffer) : void {
        let size = this.hash.limit();
        out.put(size);

        this.hash.position(0);
        let data = this.hash.toUint8Array();
        out.putArray(data, 0, size);

        let bl = this.left ? 1 : 0;
        out.put(bl);
    }

    public static createFromBinary(input : ByteBuffer) : MerkleCertificateElement {
        let size = input.get();

        let buff = input.getByteBuffer(size);

        let bl = input.get();
        let left = (bl >= 1);

        return new MerkleCertificateElement(buff, left);
    }

    public copyData() : IBlockObject {
        return new MerkleCertificateElement(this.hash, this.left);
    }
}