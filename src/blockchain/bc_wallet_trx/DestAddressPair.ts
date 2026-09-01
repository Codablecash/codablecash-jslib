import { IComparable } from "../../db/base/IComparable";
import { AddressDescriptor } from "../bc_base/AddressDescriptor";
import { BalanceUnit } from "../bc_base/BalanceUnit";


export class DestAddressPair implements IComparable {
	private dest : AddressDescriptor;
	private amount : BalanceUnit;

    constructor(dest : AddressDescriptor, amount : BalanceUnit){
        this.dest = dest;
        this.amount = amount;
    }
	public compareTo(other: IComparable | null): number {
		throw new Error("Method not implemented.");
	}

    public getDest() : AddressDescriptor {
		return this.dest;
	}
	public getAmount() : BalanceUnit {
		return this.amount;
	}
}