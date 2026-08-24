import { ArrayList } from "../../db/base/ArrayList";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";
import { BalanceUnit } from "../bc_base/BalanceUnit";
import { AbstractUtxo } from "../bc_trx/AbstractUtxo";


export class AddressDescriptorUtxoData implements IBlockObject {
    private list : ArrayList<AbstractUtxo>;

    constructor() {
        this.list = new ArrayList<AbstractUtxo>();
    }

    public binarySize(): number {
        let total = 2; //sizeof(uint16_t);

        let maxLoop = this.list.size();
        for(let i = 0; i != maxLoop; ++i){
            let utxo = this.list.get(i);

            if(utxo != null){
                total += utxo.binarySize();
            }
        }

        return total;
    }
    public toBinary(out: ByteBuffer): void {
        let maxLoop = this.list.size();
        out.putShort(maxLoop);

        for(let i = 0; i != maxLoop; ++i){
            let utxo = this.list.get(i);

            if(utxo){
                utxo.toBinary(out);
            }
        }
    }
    public static fromBinary(input : ByteBuffer) : AddressDescriptorUtxoData {
        let data = new AddressDescriptorUtxoData();

        let maxLoop = input.getShort();
        for(let i = 0; i != maxLoop; ++i){
            let utxo = AbstractUtxo.createFromBinary(input);

            if(utxo != null){
                data.add(utxo);
            }
        }

        return data;
    }

    public copyData(): IBlockObject {
        let data = new AddressDescriptorUtxoData();

        let maxLoop = this.list.size();
        for(let i = 0; i != maxLoop; ++i){
            let v = this.list.get(i);

            if(v != null){ // guard
                let utxo = <AbstractUtxo>(v.copyData());;
                data.add(utxo);
            }
        }

        return data;
    }

    public add(utxo : AbstractUtxo) : void {
        this.list.addElement(<AbstractUtxo>(utxo.copyData()));
    }

    public getTotalAmount() : BalanceUnit {
        let ret = new BalanceUnit(0);

        let maxLoop = this.list.size();
        for(let i = 0; i != maxLoop; ++i){
            let v = this.list.get(i);

            if(v != null){ // guard
                let am = v.getAmount();
                ret = ret.addSelf(am);
            }
        }

        return ret;
    }
}