import { LongRange } from "./LongRange";


export class LongRangeHitStatus {
	public included : LongRange | null;
	public lower : LongRange | null;
	public higher : LongRange | null;

	public includedPos : number;
	public lowerPos : number;
	public higherPos : number;

	public current : LongRange;

    constructor(range : LongRange) {
        this.current = new LongRange(range.getMin(), range.getMax());
        this.included = null;
        this.lower = null;
        this.higher = null;

        this.includedPos = -1;
        this.lowerPos = -1;
        this.higherPos = -1;        
    }

    public lowJoinable() : boolean {
        return (this.lower != null && this.lower.getMax() + 1 == this.current.getMin() ) ||
                ( this.included != null );
    }

    public highJoinable() : boolean {
	return (this.higher != null && this.higher.getMin() - 1 == this.current.getMax()) ||
			( this.included != null );
    }

    public hasIncluded() : boolean {
        return this.included != null;
    }

    public getLow() : LongRange | null {
	    return this.included == null && this.lower != null ? this.lower : 
            (this.included != null ? this.included : null);
    }

    public getHigh() : LongRange | null {
        return this.included == null && this.higher != null ? this.higher :
            (this.included != null ? this.included : null);
    }

    public getIncluded() : LongRange  | null {
        return this.included;
    }

    public getHighPos() : number {
        return this.included == null ? this.higherPos : this.includedPos;
    }

    public getLowerIncludePos() : number {
        if(this.included == null && this.lower == null){
            return -1;
        }
        return this.included != null ? this.includedPos - 1 : this.lowerPos;
    }

    public getHigherIncludePos(listSize : number) {
        if(this.included == null && this.higher == null){
            return listSize;
        }
        return this.included != null ? this.includedPos + 1 : this.higherPos;
    }
}
