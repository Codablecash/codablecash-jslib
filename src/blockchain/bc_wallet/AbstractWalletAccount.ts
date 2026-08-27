
export class AbstractWalletAccount {
    protected accountIndex : number;
    protected zone : number;

    constructor(zone : number, accountIndex : number){
        this.zone = zone;
        this.accountIndex = accountIndex;
    }

	public getZone() : number {
		return this.zone;
	}
}