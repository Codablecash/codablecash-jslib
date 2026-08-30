import { ArrayList } from "../../db/base/ArrayList";
import { IComparable } from "../../db/base/IComparable";
import { NullPointerException } from "../../db/base/NullPointerException";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";
import { AddressDescriptor } from "../bc_base/AddressDescriptor";
import { Coinbase } from "../bc_block_body/Coinbase";
import { Stakebase } from "../bc_block_body/Stakebase";
import { TicketUtxoReference } from "../bc_finalizer_trx/TicketUtxoReference";
import { TicketVotedUtxoReference } from "../bc_finalizer_trx/TicketVotedUtxoReference";
import { BalanceUtxoReference } from "../bc_trx_balance/BalanceUtxoReference";
import { BloomFilter1024 } from "../bc_wallet_filter/BloomFilter1024";
import { BloomHash1024 } from "../bc_wallet_filter/BloomHash1024";
import { UtxoId } from "./UtxoId";

export abstract class AbstractUtxoReference implements IBlockObject, IComparable {
    public static UTXO_REF_TYPE_BALANCE = 1;
    public static UTXO_REF_TYPE_UTXO_TICKET = 2;
    public static UTXO_REF_TYPE_UTXO_VOTED_TICKET = 3;
    public static UTXO_REF_TYPE_COINBASE = 4;
    public static UTXO_REF_TYPE_STAKEBASE = 5;
    public static UTXO_REF_TYPE_REMOTE = 6;

    protected utxoId : UtxoId | null;
    protected bloomHash : BloomHash1024 | null;

    constructor(){
        this.utxoId = null;
        this.bloomHash = null;
    }

    public compareTo(other: IComparable | null): number {
        let o = <AbstractUtxoReference>other;
        if(o == null || o.utxoId == null){
            if(this.utxoId == null){
                return 0;
            }
            return 1;
        }
        if(this.utxoId == null){
            return -1;
        }

        return this.utxoId.compareTo(o.utxoId);
    }

    public static createFromBinary(input : ByteBuffer) : AbstractUtxoReference {
        let ret : AbstractUtxoReference | null = null;

        let type = input.get();
        switch(type){
        case AbstractUtxoReference.UTXO_REF_TYPE_BALANCE:
            ret = new BalanceUtxoReference();
            break;
        case AbstractUtxoReference.UTXO_REF_TYPE_UTXO_TICKET:
            ret = new TicketUtxoReference();
            break;
        case AbstractUtxoReference.UTXO_REF_TYPE_UTXO_VOTED_TICKET:
            ret = new TicketVotedUtxoReference();
            break;
        case AbstractUtxoReference.UTXO_REF_TYPE_COINBASE:
            ret = new Coinbase();
            break;
        case AbstractUtxoReference.UTXO_REF_TYPE_STAKEBASE:
            ret = new Stakebase();
            break;
        default:
            throw new NullPointerException("AbstractUtxoReference.createFromBinary()");
        }

        ret.fromBinary(input);

        return ret;
    }

    public abstract getType() : number;
    public abstract binarySize(): number;
    public abstract toBinary(out: ByteBuffer): void;
    public abstract fromBinary(input : ByteBuffer) : void;
    
    public copyData(): IBlockObject {
        let cap = this.binarySize();
        let buff = ByteBuffer.allocateWithEndian(cap, true);

        this.toBinary(buff);
        buff.position(0);

        let ref = AbstractUtxoReference.createFromBinary(buff);
        return ref;
    }

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
