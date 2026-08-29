import { NullPointerException } from "../../db/base/NullPointerException";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { AbstractUtxoReference } from "../bc_trx/AbstractUtxoReference";
import { UtxoId } from "../bc_trx/UtxoId";
import { BloomHash1024 } from "../bc_wallet_filter/BloomHash1024";

export class TicketUtxoReference extends AbstractUtxoReference {

    public getType(): number {
        return AbstractUtxoReference.UTXO_REF_TYPE_UTXO_TICKET;
    }
    
    public binarySize(): number {
        if(this.utxoId != null && this.bloomHash != null){
            let total =  1; //sizeof(uint8_t);
            total += this.utxoId.binarySize();

            total += this.bloomHash.binarySize();

            return total;
        }
        throw new NullPointerException("TicketUtxoReference.binarySize()");
    }
    public toBinary(out: ByteBuffer): void {
        if(this.utxoId != null && this.bloomHash != null){
            out.put(this.getType());
            this.utxoId.toBinary(out);

            this.bloomHash.toBinary(out);
        }
        throw new NullPointerException("TicketUtxoReference.toBinary()");
    }
    public fromBinary(input: ByteBuffer): void {
        this.utxoId = UtxoId.fromBinary(input);

        this.bloomHash = BloomHash1024.createFromBinary(input);
    }

}