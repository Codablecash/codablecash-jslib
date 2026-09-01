import { Abstract32BytesId } from "../../blockchain/bc_base/Abstract32BytesId";
import { NullPointerException } from "../../db/base/NullPointerException";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";

export class TransferedDataId extends Abstract32BytesId {

    public static fromBinary(input : ByteBuffer) : TransferedDataId {
        let transferedDataId = new TransferedDataId();

        let cap = input.getInt();

        transferedDataId.id = input.getByteBuffer(cap);
        transferedDataId.id.position(0);

        return transferedDataId;
    }

    public copyData(): IBlockObject {
        if(this.id != null){
            return new TransferedDataId(this.id.toUint8Array(), this.id.limit());
        }
        throw new NullPointerException("TransferedDataId.copyData()");
    }
}