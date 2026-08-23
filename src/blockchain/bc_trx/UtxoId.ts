import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";
import { Abstract32BytesId } from "../bc_base/Abstract32BytesId";


export class UtxoId extends Abstract32BytesId {
    constructor(binary? : Uint8Array, length? : number){
        super(binary, length);
    }

    public copyData() : IBlockObject {
        return new UtxoId(this.id?.toUint8Array(), this.id?.limit());
    }

    public static fromBinary(input : ByteBuffer) : UtxoId {
        let utxoId = new UtxoId();

        let cap = input.getInt();

        let buff = input.getByteBuffer(cap);

        utxoId.id = buff;
        utxoId.id.position(0);

        return utxoId;
    }
}