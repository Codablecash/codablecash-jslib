import { ScPrivateKey } from "../../base/ecda/ScPrivateKey";
import { NullPointerException } from "../../db/base/NullPointerException";
import { BalanceAddress } from "../bc_base/BalanceAddress";

export class AddressAndPrivateKey {
	private privateKey : ScPrivateKey | null
	private address : BalanceAddress | null;

    constructor(){
        this.privateKey = null;
        this.address = null;
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