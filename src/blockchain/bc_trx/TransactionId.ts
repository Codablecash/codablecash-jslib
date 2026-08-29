import { NullPointerException } from "../../db/base/NullPointerException";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";
import { Abstract32BytesId } from "../bc_base/Abstract32BytesId";

export class TransactionId extends Abstract32BytesId {

    constructor(binary? : Uint8Array, length? : number){
        super(binary, length);
    }

    
    public binarySize() : number {
        return super.binarySize();
    }
    public toBinary(out : ByteBuffer) : void {
        super.toBinary(out);
    }
    public static fromBinary(input : ByteBuffer) : TransactionId {
        let trxId = new TransactionId();

        let cap = input.getInt();      
        trxId.id = input.getByteBuffer(cap);
        trxId.id.position(0);

        return trxId;
    }

    public copyData() : IBlockObject {
        if(this.id != null){
            return new TransactionId(this.id.toUint8Array(), this.id.limit());
        }
        throw new NullPointerException("TransactionId.copyData()");
    }
}