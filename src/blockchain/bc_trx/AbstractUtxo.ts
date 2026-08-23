import { Sha256 } from "../../base/crypto/Sha256";
import { NullPointerException } from "../../db/base/NullPointerException";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";
import { UtxoId } from "./UtxoId";

export abstract class AbstractUtxo implements IBlockObject {
    private utxoId : UtxoId | null;
    private nonce : Uint8Array;

    constructor() {
        this.utxoId = null;
        this.nonce = new Uint8Array(32);
    }

    public abstract getType() : number;
    public abstract fromBinary(input : ByteBuffer) : void;
    public abstract build() : void;

    public abstract binarySize(): number;
    public abstract toBinary(out: ByteBuffer): void;
    public abstract copyData(): IBlockObject;

    public equals(other : AbstractUtxo) : boolean {
        if(this.utxoId != null && other.utxoId != null){
            return this.utxoId.equals(other.utxoId);
        }
	    throw new NullPointerException("AbstractUtxo.equals()");
    }

    public setNonce(data32bytes : Uint8Array, index : number) {
        let buff = ByteBuffer.allocateWithEndian(32 + 4, true);
        buff.putArray(data32bytes, 0, 32);
        buff.putInt(index);
        buff.position(0);

        let sha = Sha256.sha256(buff.toUint8Array(), true);
        sha.position(0);

        this.nonce = sha.toUint8Array();
    }

    public getId() : UtxoId {
        if(this.utxoId != null){
            return this.utxoId;
        }
        throw new NullPointerException("AbstractUtxo.getId()");
    }
}