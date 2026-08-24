import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { AbstractUtxoReference } from "../bc_trx/AbstractUtxoReference";

export class TicketVotedUtxoReference extends AbstractUtxoReference {

    public getType(): number {
        return AbstractUtxoReference.UTXO_REF_TYPE_UTXO_VOTED_TICKET;
    }

    public binarySize(): number {
        throw new Error("Method not implemented.");
    }
    public toBinary(out: ByteBuffer): void {
        throw new Error("Method not implemented.");
    }
    public fromBinary(input: ByteBuffer): void {
        throw new Error("Method not implemented.");
    }

}