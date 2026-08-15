import { ArrayList } from "../base/ArrayList";
import { ByteBuffer } from "../base_io/ByteBuffer";
import { FileIOException } from "../osenv/FileIOException";
import { LongRange } from "./LongRange";
import { LongRangeHitStatus } from "./LongRangeHitStatus";
import { LongRangeIterator } from "./LongRangeIterator";


export class LongRangeList {
    private list : ArrayList<LongRange>;

    constructor(){
        this.list = new ArrayList<LongRange>();
    }

    public get(pos : number) {
        return this.list.get(pos);
    }

    public size() {
        return this.list.size();
    }

    public isEmpty() {
        return this.list.isEmpty();
    }

    public removeRange(value : number | LongRange, max? : number) : void {
        if(typeof value == "number" && max != undefined){
            this.__removeRange(value, max);
            return;
        }

        this._removeRange((value as unknown) as LongRange);
    }

    private __removeRange(min : number, max : number) : void {
        let range = new LongRange(min, max);
        this.removeRange(range);
    }

    private _removeRange(range : LongRange) : void {
        let minStatus = this.hitStatus(range.getMin(), range, false);
        let maxStatus = this.hitStatus(range.getMax(), range, true);

        // check inclusion
        this.removeInclusion(range);

        // split
        if(this.needSplit(minStatus, maxStatus, range)){
            return;
        }

        // no split
        if(minStatus.hasIncluded()){
            let r = minStatus.getIncluded();

            if(r != null){
                let remove = r.removeHigh(range.getMin());

                if(remove){
                    let idx = this.list.indexOfPtr(r);
                    this.list.remove(idx);
                }
            }

        }
        if(maxStatus.hasIncluded()){
            let r = maxStatus.getIncluded();

            if(r != null){
                let remove = r.removeLow(range.getMax());
                if(remove){
                    let idx = this.list.indexOfPtr(r);
                    this.list.remove(idx);
                }
            }
        }
    }


    public needSplit(minStatus : LongRangeHitStatus, maxStatus : LongRangeHitStatus, range : LongRange) : boolean {
        let minRange = minStatus.getIncluded();
        let maxRange = maxStatus.getIncluded();

        if((minRange != null && maxRange != null && minRange != maxRange) ||
                (minRange == null && maxRange == null)){
            return false;
        }

        let highRangeStart = range.getMax();
        let lowRangeStart = range.getMin();

        let lowExists = minRange != null && minRange.getMin() < lowRangeStart;
        let highExists = minRange != null && minRange.getMax() > highRangeStart;

        if(lowExists && highExists && minRange != null){
            let low = minRange.getMin();
            let high = lowRangeStart - 1;

            let newRange = new LongRange(low, high);

            minRange.setMin(highRangeStart + 1);

            this.insertRange(minStatus.includedPos, newRange);
        }
        else if(!lowExists && highExists && minRange != null){
            minRange.setMin(highRangeStart + 1);
        }
        else if(lowExists && !highExists && minRange != null){
            minRange.setMax(lowRangeStart - 1);
        }
        else{
            let r = this.list.get(minStatus.includedPos);
            this.list.remove(minStatus.includedPos);
        }

       return true;
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

        // check inclusion
        let removedInc = this.removeInclusion(range);

        if(minStatus.lowJoinable() && maxStatus.highJoinable()){
            let removePos = maxStatus.getHighPos() - removedInc;
            let rangeHigh = maxStatus.getHigh();
            let rangeLow = minStatus.getLow();

            if(rangeLow != null && rangeHigh != null){
                rangeLow.setMin(rangeLow.getMin() < range.getMin() ? rangeLow.getMin() : range.getMin());
                rangeLow.setMax(rangeHigh.getMax() > range.getMax() ? rangeHigh.getMax() : range.getMax());

                if(rangeHigh != rangeLow){
                    this.list.remove(removePos);
                }
            }
        }
        else if(!minStatus.lowJoinable() && maxStatus.highJoinable()){
            let range2update = maxStatus.getHigh(); // high from range
        
            if(range2update != null){
                range2update.setMin(range.getMin());
            }
        }
        else if(minStatus.lowJoinable() && !maxStatus.highJoinable()){
            let range2update = minStatus.getLow(); // low from range

            if(range2update != null){
                range2update.setMax(range.getMax());
            }
        }
        else { // if(!minStatus.lowJoinable() && !maxStatus.highJoinable()){
            let insertPos = minStatus.lower != null ? minStatus.lowerPos + 1 : 0;
            this.insertRange(insertPos, range);
        }
    }

    private addRangeLongRange(range : LongRange){
        let min = range.getMin();
        let max = range.getMax();

        this.addRange(min, max);
    }

    private removeInclusion(range : LongRange){
        let minStatus = this.hitStatus(range.getMin(), range, true);
        let maxStatus = this.hitStatus(range.getMax(), range, false);

        let minPos = minStatus.getHigherIncludePos(this.list.size());
        let maxPos = maxStatus.getLowerIncludePos(); // getHighPos(this.list.size()) - 1;

        let length = maxPos - minPos + 1;
        for(let i = 0; i < length; ++i){
            this.list.remove(minPos);
        }

        return length;
    }
    
    private insertRange(pos : number, range : LongRange) {
        let lastSize = this.list.size();

        this.list.addElement(null);

        for(let i = lastSize; i != pos; --i){
            let r = this.list.get(i - 1);
            this.list.setElement(r, i);
        }

        this.list.setElement(range, pos);
    }
        
    private hitStatus(value : number, range : LongRange, findHigher : boolean) : LongRangeHitStatus {
        let status = new LongRangeHitStatus(range);

        let begin = 0;
        let end = this.list.size() - 1;

        let minIndex;
        let midRange : LongRange | null;

        let mid = -1;
        do {
            mid = Math.trunc((begin + end) / 2)

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

    public binarySize() : number {
        let size = 4;

        let maxLoop = this.list.size();
        for(let i = 0; i != maxLoop; ++i){
            let range = this.list.get(i);

            if(range != null){ // guard
                size += range.binarySize();
            }
        }

        return size;
    }

    public toBinary(buff : ByteBuffer) : void {
        let size = this.size();
        buff.putInt(size);

        for(let i = 0; i != size; ++i){
            let range = this.list.get(i);

            if(range != null){ // guard
                range.toBinary(buff);   
            }
        }
    }

    public static fromBinary(buff : ByteBuffer) {
        let list = new LongRangeList();

        let size = buff.getInt();

        for(let i = 0; i != size; ++i){
            let range = LongRange.fromBinary(buff);

            list.addRange(range.getMin(), range.getMax());
        }

        return list;
    }

    public iterator() : LongRangeIterator {
	    return new LongRangeIterator(this);
    }


    public assertList() {
        let lastRange = null;

        let maxLoop = this.list.size();
        for(let i = 0; i != maxLoop; ++i){
            let range = this.list.get(i);

            if(lastRange == null){
                lastRange = range;
                continue;
            }

            let rangeMin = range != null ? range.getMin() : -1;
            let rangeMax = lastRange.getMax();

            if(!(rangeMax < rangeMin)){
                throw new FileIOException("Range assert");
            }

            lastRange = range;
        }
    }
}

