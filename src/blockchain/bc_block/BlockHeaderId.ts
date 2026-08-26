import { NullPointerException } from "../../db/base/NullPointerException";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";
import { Abstract32BytesId } from "../bc_base/Abstract32BytesId";


export class BlockHeaderId extends Abstract32BytesId {

    public static fromBinary(input : ByteBuffer) : BlockHeaderId {
        let trxId = new BlockHeaderId();

        let cap = input.getInt();

        trxId.id = input.getByteBuffer(cap);
        trxId.id.position(0);

        return trxId;
    }

    public copyData() : IBlockObject {
        if(this.id != null){
            this.id.position(0);
            return new BlockHeaderId(this.id.toUint8Array(), this.id.limit());
        }
        throw new NullPointerException("BlockHeaderId.copyData()");
    }
}