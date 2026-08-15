import { ArrayList } from "../base/ArrayList";
import { LongRange } from "./LongRange";
import { LongRangeHitStatus } from "./LongRangeHitStatus";


export class LongRangeList {
    private list : ArrayList<LongRange>;

    constructor(){
        this.list = new ArrayList<LongRange>();
    }

    public addRange(value : number | LongRange, max? : number) {
        if(typeof value == "number"){
            if(max != undefined){
                this.__addRange(value, max);
            }else{
                this.__addRange(value, value);
            }

            return;
        }


        let v = (value as unknown) as LongRange;
        this.addRangeLongRange(v);
    }

    private __addRange(min : number, max : number) {
        if(this.list.isEmpty()){
            let newRange = new LongRange(min, max);
            this.list.addElement(newRange);
            return;
        }

        // check
        let range = new LongRange(min, max);
        let minStatus = this.hitStatus(range.getMin(), range, false);
        let maxStatus = this.hitStatus(range.getMax(), range, true);



        /*
	// check inclusion
	int removedInc = removeInclusion(range);

	if(minStatus->lowJoinable() && maxStatus->highJoinable()){
		int removePos = maxStatus->getHighPos() - removedInc;
		LongRange* rangeHigh = maxStatus->getHigh();
		LongRange* rangeLow = minStatus->getLow();

		rangeLow->setMin(rangeLow->getMin() < range->getMin() ? rangeLow->getMin() : range->getMin());
		rangeLow->setMax(rangeHigh->getMax() > range->getMax() ? rangeHigh->getMax() : range->getMax());

		if(rangeHigh != rangeLow){
			list->remove(removePos);
			delete rangeHigh;
		}

		delete range;
	}
	else if(!minStatus->lowJoinable() && maxStatus->highJoinable()){
		LongRange* range2update = maxStatus->getHigh(); // high from range
		assert(range2update != nullptr);

		range2update->setMin(range->getMin());
		delete range;
	}
	else if(minStatus->lowJoinable() && !maxStatus->highJoinable()){
		LongRange* range2update = minStatus->getLow(); // low from range
		assert(range2update != nullptr);

		range2update->setMax(range->getMax());

		delete range;
	}
	else { // if(!minStatus->lowJoinable() && !maxStatus->highJoinable()){
		int insertPos = minStatus->lower != nullptr ? minStatus->lowerPos + 1 : 0;
		insertRange(insertPos, range);
	}
        */
    }

    private addRangeLongRange(range : LongRange){
        let min = range.getMin();
        let max = range.getMax();

        this.addRange(min, max);
    }
    
    private hitStatus(value : number, range : LongRange, findHigher : boolean) : LongRangeHitStatus {
        let status = new LongRangeHitStatus(range);

        let begin = 0;
        let end = this.list.size() - 1;

        let minIndex;
        let midRange : LongRange | null;

        let mid = -1;
        do {
            mid = (begin + end) / 2;

            midRange = this.list.get(mid);
            if(midRange != null){
                let cmp = midRange.compare(value);

                if(cmp < 0){
                    begin = mid + 1;
                }
                else if(cmp > 0){
                    end = mid - 1;
                }
                else { // cmp == 0
                    status.included = midRange;
                    status.includedPos = mid;
                    return status;
                }
            }
        }while(begin <= end);

        // find nearest
        if(findHigher){
            let listSize = this.list.size();
            while(mid < listSize){
                midRange = this.list.get(mid);
                if(midRange != null && midRange.compare(value) > 0){
                    status.higher = midRange;
                    status.higherPos = mid;
                    break;
                }
                mid++;
            }
        }
        else{ // lower range
            while(mid >= 0){
                midRange = this.list.get(mid);
                if(midRange != null && midRange.compare(value) < 0){
                    status.lower = midRange;
                    status.lowerPos = mid;
                    break;
                }
                mid--;
            }
        }

        return status;
    }
}

