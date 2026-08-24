import { ArrayList } from "../../db/base/ArrayList";
import { NullPointerException } from "../../db/base/NullPointerException";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";
import { AddressDescriptor } from "../bc_base/AddressDescriptor";
import { BloomFilter1024 } from "../bc_wallet_filter/BloomFilter1024";
import { BloomHash1024 } from "../bc_wallet_filter/BloomHash1024";
import { UtxoId } from "./UtxoId";

export abstract class AbstractUtxoReference implements IBlockObject {
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

    public abstract getType() : number;
    public abstract binarySize(): number;
    public abstract toBinary(out: ByteBuffer): void;
    
    public abstract copyData(): IBlockObject;

    public isRemote() : boolean {
        return false;
    }

    public getUtxoId() : UtxoId {
        if(this.utxoId != null){
            return this.utxoId;
        }
        throw new NullPointerException("AbstractUtxoReference.getUtxoId()");
    }

    public setUtxoId(utxoId : UtxoId, addressDesc : AddressDescriptor) : void {
        this.utxoId = <UtxoId>(utxoId.copyData());

        this.bloomHash = null;
        if(addressDesc != null){ // guard
            let filter = new BloomFilter1024();
            this.bloomHash = filter.getHash(addressDesc);
        }
    }

    public checkFilter(filtersList : ArrayList<BloomFilter1024>) : boolean {
        let ret = false;

        let maxLoop = filtersList.size();
        for(let i = 0; i != maxLoop; ++i){
            let filter = filtersList.get(i);

            if(filter != null && this.bloomHash != null){
                let bl = filter.checkBytes1024(this.bloomHash);
                if(bl){
                    ret = true;
                    break;
                }
            }
        }

        return ret;
    }
}
