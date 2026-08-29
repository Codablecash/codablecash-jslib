import { NullPointerException } from "../../db/base/NullPointerException";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";
import { Abstract32BytesId } from "../bc_base/Abstract32BytesId";


export class BlockMerkleRoot extends Abstract32BytesId {

    constructor(binary : Uint8Array, length : number){
        super(binary, length);
    }

    public copyData(): IBlockObject {
        if(this.id != null){
            return new BlockMerkleRoot(this.id.toUint8Array(), 32);
        }
        throw new NullPointerException("BlockMerkleRoot.fromBinary()");
    }

    public static createZeroRoot() : BlockMerkleRoot {
        let data = new Uint8Array(32);
        data.fill(0);
        return new BlockMerkleRoot(data, 32);
    }

    public static fromBinary(input : ByteBuffer) : BlockMerkleRoot {
        let b = input.getByteBuffer(32);
        return new BlockMerkleRoot(b.toUint8Array(), 32);
    }

}