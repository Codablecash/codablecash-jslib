import { Secp256k1CompressedPoint } from "../../base/ecda/Secp256k1CompressedPoint";
import { NullPointerException } from "../../db/base/NullPointerException";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";
import { AbstractUtxoReference } from "../bc_trx/AbstractUtxoReference";
import { UtxoId } from "../bc_trx/UtxoId";
import { BloomHash1024 } from "../bc_wallet_filter/BloomHash1024";

export class BalanceUtxoReference extends AbstractUtxoReference {
    private Xi : Secp256k1CompressedPoint | null;

    constructor(){
        super();
        this.Xi = null;
    }

    public getType(): number {
        return AbstractUtxoReference.UTXO_REF_TYPE_BALANCE;
    }

    public binarySize(): number {
        if(this.Xi != null && this.utxoId != null && this.bloomHash != null){
            let total = 1; //sizeof(uint8_t);
            total += this.utxoId.binarySize();
            total += this.Xi.binarySize();

            total += this.bloomHash.binarySize();

            return total;
        }
        throw new NullPointerException("BalanceUtxoReference.binarySize()");
    }
    public toBinary(out: ByteBuffer): void {
        if(this.Xi != null && this.utxoId != null && this.bloomHash != null){
            out.put(this.getType());
            this.utxoId.toBinary(out);
            this.Xi.toBinary(out);

            this.bloomHash.toBinary(out);
        }
        throw new NullPointerException("BalanceUtxoReference.toBinary()");
    }
    public fromBinary(input : ByteBuffer) : void {
        this.utxoId = UtxoId.fromBinary(input);

        let adr = Secp256k1CompressedPoint.fromBinary(input);
        this.Xi = <Secp256k1CompressedPoint>(adr);

        this.bloomHash = BloomHash1024.createFromBinary(input);
    }

}