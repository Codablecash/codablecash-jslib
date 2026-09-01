import { ScPrivateKey } from "../../base/ecda/ScPrivateKey";
import { IComparable } from "../../db/base/IComparable";
import { NullPointerException } from "../../db/base/NullPointerException";
import { BalanceAddress } from "../bc_base/BalanceAddress";

export class AddressAndPrivateKey implements IComparable {
	private privateKey : ScPrivateKey | null
	private address : BalanceAddress | null;

    constructor(){
        this.privateKey = null;
        this.address = null;
    }

    public compareTo(other: IComparable | null): number {
        let o = <AddressAndPrivateKey>other;
        if(o == null|| o.privateKey == null){
            if(this.privateKey == null){
                return 0;
            }
            return 1;
        }
        if(this.privateKey == null){
            return -1;
        }
        return this.privateKey.compareTo(o.privateKey);
    }

	public getAddress() : BalanceAddress {
        if(this.address != null){
            return this.address;
        }
		throw new NullPointerException("AddressAndPrivateKey.getAddress()");
	}
	public getPrivateKey() : ScPrivateKey {
        if(this.privateKey != null){
            return this.privateKey;
        }
		throw new NullPointerException("AddressAndPrivateKey.getPrivateKey()");
	}

    public setPrivateKey(privateKey : ScPrivateKey) : void {
        this.privateKey = privateKey;
    }

    public setBalanceAddress(address : BalanceAddress) : void {
        this.address = address;
    }
}