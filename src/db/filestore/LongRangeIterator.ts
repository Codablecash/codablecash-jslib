import { LongRange } from "./LongRange";
import { LongRangeList } from "./LongRangeList";


export class LongRangeIterator {
	private list : LongRangeList;
	private listIndex : number;
	private current : number;

    constructor(list : LongRangeList){
        this.list = list;

        this.listIndex = 0;
        if(this.list.isEmpty()){
            this.current = -1;
        }
        else {
            let range = list.get(this.listIndex);
            this.current = range != null ? range.getMin() : -1;            
        }
    }

    public hasNext() {
        if(this.list.isEmpty() || this.listIndex == this.list.size())
        {
            return false;
        }
        return this.current > 0;
    }

    public next() {
        let ret = this.current;
        let range = this.list.get(this.listIndex);
        if(range != null && range.hasNext(this.current)){
            this.current ++ ;
        }
        else {
            if(this.list.size() - 1 > this.listIndex && range != null){
                this.listIndex ++ ;
                range = this.list.get(this.listIndex);
                this.current = range != null ? range.getMin() : -1;
            }
            else {
                this.current = -1;
            }
        }
        return ret;
    }
}
