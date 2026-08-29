import { NullPointerException } from "../../db/base/NullPointerException";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";
import { Abstract32BytesId } from "../bc_base/Abstract32BytesId";

export class BlockHeaderCommandId extends Abstract32BytesId {
    constructor(binary? : Uint8Array, length? : number){
        super(binary, length);
    }

    public static fromBinary(input : ByteBuffer) : BlockHeaderCommandId {
        let commandId = new BlockHeaderCommandId();

        let cap = input.getInt();
        commandId.id = input.getByteBuffer(cap);
        commandId.id.position(0);

        return commandId;
    }

    public copyData() : IBlockObject {
        if(this.id != null){
            return new BlockHeaderCommandId(this.id.toUint8Array(), this.id.limit());
        }
        throw new NullPointerException("BlockHeaderCommandId.copyData()");
    }

    public static makeRandomHeaderId() : BlockHeaderCommandId {
        let buff = this.makeRandom16Bytes();

        let blockHeaderId = new BlockHeaderCommandId(buff.toUint8Array(), buff.capacity());

        return blockHeaderId;
    }   
}