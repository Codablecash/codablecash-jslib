import { NullPointerException } from "../../db/base/NullPointerException";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { AbstractBtreeKey } from "../../db/btree/AbstractBtreeKey";
import { AddressDescriptor } from "../bc_base/AddressDescriptor";
import { AbstractUtxo } from "../bc_trx/AbstractUtxo";
import { AddressDescriptorKeyFactory } from "./AddressDescriptorKeyFactory";


export class AddressDescriptorKey extends AbstractBtreeKey {
	private desc : AddressDescriptor;
	private utxo : AbstractUtxo | null; // remove param

    constructor(desc : AddressDescriptor) {
        super();
        this.desc = <AddressDescriptor>(desc.copyData());
        this.utxo = null;
    }

    public getUtxo() : AbstractUtxo {
        if(this.utxo != null){
            return this.utxo;
        }
        throw new NullPointerException("AddressDescriptorKey.getUtxo()");
    }

	public isInfinity() : boolean {
        return false;
    }
	public isNull() : boolean {
        return false;
    }

    public binarySize() : number {
        let size = 4; //sizeof(uint32_t);
        size += this.desc.binarySize();

        return size;
    }

    public toBinary(out : ByteBuffer) : void {
        out.putInt(AddressDescriptorKeyFactory.ADDRESS_DESC_KEY);

        this.desc.toBinary(out);
    }

    public static fromBinary(input : ByteBuffer) : AddressDescriptorKey {
        let desc = AddressDescriptor.createFromBinary(input);

        return new AddressDescriptorKey(desc);
    }

    public compareTo(key: AbstractBtreeKey): number {
        if(key.isInfinity()){
            return -1;
        }
        else if(key.isNull()){
            return 1;
        }

        let other = <AddressDescriptorKey>(key);

        return this.desc.compareTo(other.desc);
    }
    public clone(): AbstractBtreeKey {
        let inst = new AddressDescriptorKey(this.desc);
        inst.utxo = this.utxo != null ? <AbstractUtxo>this.utxo.copyData() : null;

        return inst;
    }
}