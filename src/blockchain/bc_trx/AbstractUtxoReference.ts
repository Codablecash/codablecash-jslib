import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";
import { BloomHash1024 } from "../bc_wallet_filter/BloomHash1024";
import { UtxoId } from "./UtxoId";

export class AbstractUtxoReference implements IBlockObject {
    public static UTXO_REF_TYPE_BALANCE = 1;
    public static UTXO_REF_TYPE_UTXO_TICKET = 2;
    public static UTXO_REF_TYPE_UTXO_VOTED_TICKET = 3;
    public static UTXO_REF_TYPE_COINBASE = 4;
    public static UTXO_REF_TYPE_STAKEBASE = 5;
    public static UTXO_REF_TYPE_REMOTE = 6;

    private utxoId : UtxoId | null;
    private bloomHash : BloomHash1024 | null;

    constructor(){
        this.utxoId = null;
        this.bloomHash = null;
    }


    binarySize(): number {
        throw new Error("Method not implemented.");
    }
    toBinary(out: ByteBuffer): void {
        throw new Error("Method not implemented.");
    }
    
    copyData(): IBlockObject {
        throw new Error("Method not implemented.");
    }
	
}
