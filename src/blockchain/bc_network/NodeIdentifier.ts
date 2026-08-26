import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";
import { BigInteger } from "../../db/numeric/BigInteger";

export class NodeIdentifier implements IBlockObject {

    private nodeIdentifier : BigInteger; // pubkey

    constructor(pubkey? : BigInteger){
        if(pubkey != undefined){
            this.nodeIdentifier = pubkey.copy();
        }else{
            this.nodeIdentifier = new BigInteger("0");
        }
    }

	public getPublicKey() : BigInteger {
		return this.nodeIdentifier;
	}

    binarySize(): number {
        return 4 + this.nodeIdentifier.binarySize();
    }
    toBinary(out: ByteBuffer): void {
        let buff2 = this.nodeIdentifier.toBinary();
        out.putInt(buff2.capacity());
        out.putByteBuffer(buff2);
    }
    public static fromBinary(input : ByteBuffer) : NodeIdentifier {
        let nodeId = new NodeIdentifier();

        {
            let size = input.getInt();
            let buff = input.getByteBuffer(size);

            nodeId.nodeIdentifier = BigInteger.fromBinary(buff);
        }

        return nodeId;
    }

    copyData(): IBlockObject {
        return new NodeIdentifier(this.nodeIdentifier);
    }

    public compareTo(other : NodeIdentifier) : number {
        return this.nodeIdentifier.compareTo(other.nodeIdentifier);
    }

    public toString() : string {
        let str = this.nodeIdentifier.toString(16);
        return str;
    }
}