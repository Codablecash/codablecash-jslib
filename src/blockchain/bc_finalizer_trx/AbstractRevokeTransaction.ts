import { Sha256 } from "../../base/crypto/Sha256";
import { NullPointerException } from "../../db/base/NullPointerException";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { AbstractFinalizerTransaction } from "./AbstractFinalizerTransaction";

export abstract class AbstractRevokeTransaction extends AbstractFinalizerTransaction {

	canAddMempool() : boolean {
		return false;
	}

    protected setUtxoNonce() : void {
        let capacity = this.__binarySize();

        let buff = ByteBuffer.allocateWithEndian(capacity, true);
        this.__toBinary(buff);
        //__ASSERT_POS(buff);

        let sha = Sha256.sha256(buff.toUint8Array(), true);
        let data = sha.toUint8Array();

        let maxLoop = this.getUtxoSize();
        for(let i = 0; i != maxLoop; ++i){
            let utxo = this.getUtxo(i);

            utxo.setNonce(data, i);

            utxo.build();
        }
    }

    protected __binarySize() : number {
        if(this.version != null && this.timestamp != null){
            let capacity = 1 + this.version.binarySize() + this.timestamp.binarySize();

            let maxLoop = this.getUtxoReferenceSize();
            for(let i = 0; i != maxLoop; ++i){
                let ref = this.getUtxoReference(i);
                capacity += ref.binarySize();
            }

            return capacity;
        }
        throw new NullPointerException("AbstractRevokeTransaction.__binarySize()");
    }

    protected __toBinary(out : ByteBuffer) : void {
        out.put(this.getType());
        this.version.toBinary(out);
        this.timestamp.toBinary(out);

        let maxLoop = this.getUtxoReferenceSize();
        for(let i = 0; i != maxLoop; ++i){
            let ref = this.getUtxoReference(i);
            ref.toBinary(out);
        }
    }
}