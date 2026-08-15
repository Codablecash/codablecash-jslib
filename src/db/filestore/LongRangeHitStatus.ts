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
}
