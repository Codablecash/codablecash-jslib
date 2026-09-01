import { IComparable } from "../../db/base/IComparable";

export class AbstractWalletAccount implements IComparable{
    protected accountIndex : number;
    protected zone : number;

    constructor(zone : number, accountIndex : number){
        this.zone = zone;
        this.accountIndex = accountIndex;
    }
    public compareTo(other: IComparable | null): number {
        let o = <AbstractWalletAccount>other;
        if(o == null){
            return 1;
        }
        return this.accountIndex - o.accountIndex;
    }

	public getZone() : number {
		return this.zone;
	}
}