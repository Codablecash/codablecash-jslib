import { IMuSigSigner } from "../../base/musig/IMuSigSigner";
import { MuSig } from "../../base/musig/MuSig";
import { MuSigBuilder } from "../../base/musig/MuSigBuilder";
import { ArrayList } from "../../db/base/ArrayList";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { AbstractUtxoReference } from "../bc_trx/AbstractUtxoReference";
import { BalanceUtxoReference } from "./BalanceUtxoReference";
import { IMuSigSignerProvidor } from "./IMuSigSignerProvidor";
import { IUtxoFinder } from "./IUtxoFinder";

export class InputUtxoCollection {
    private list : ArrayList<BalanceUtxoReference>;

    constructor(){
        this.list = new ArrayList<BalanceUtxoReference>();
    }

    public getList() : ArrayList<BalanceUtxoReference> {
        return this.list;
    }

    public addReference(ref : BalanceUtxoReference) : void {
        let r  = <BalanceUtxoReference>(ref.copyData());
        this.list.addElement(r);
    }

    public sign(providor : IMuSigSignerProvidor, finder : IUtxoFinder, data : Uint8Array, length : number) : MuSig {
        let builder = new MuSigBuilder();

        let maxLoop = this.list.size();
        for(let i = 0; i != maxLoop; ++i){
            let ref = this.list.get(i);

            if(ref != null){
                let utxoId = ref.getUtxoId();

                let utxo = finder.getBalanceUtxo(utxoId);
                let desc = utxo.getAddress();

                let signer : IMuSigSigner = providor.getSigner(desc);
                builder.addSigner(signer);
            }
        }

        let sig = builder.sign(data, length);
        return sig;
    }

    public binarySize() : number {
        let total = 1; // sizeof(uint16_t);

        let maxLoop = this.list.size();
        for(let i = 0; i != maxLoop; ++i){
            let ref = this.list.get(i);

            if(ref != null){ // guard
                total += ref.binarySize();
            }
        }

        return total;
    }

    public toBinary(out : ByteBuffer) : void {
        let maxLoop = this.list.size();
        out.putShort(maxLoop);

        for(let i = 0; i != maxLoop; ++i){
            let ref = this.list.get(i);

            ref?.toBinary(out);
        }
    }

    public static fromBinary(input : ByteBuffer) : InputUtxoCollection {
        let collection = new InputUtxoCollection();

        let maxLoop = input.getShort();
        //BinaryUtils::checkUShortRange(maxLoop, 0, BalanceTransferTransaction::MAX_INPUT_ELEMENT);

        for(let i = 0; i != maxLoop; ++i){
            let __ref = AbstractUtxoReference.createFromBinary(input);
            //BinaryUtils::checkUint8Value(__ref.getType(), BalanceUtxoReference::UTXO_REF_TYPE_BALANCE);

            let ref = <BalanceUtxoReference>(__ref);
            collection.addReference(ref);
        }

        return collection;
    }
}