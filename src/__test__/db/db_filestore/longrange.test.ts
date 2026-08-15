import { RawBitSet } from "../../../db/base/RawBitSet";
import { LongRangeList } from "../../../db/filestore/LongRangeList"


function regBitset(bitset : RawBitSet, min : number, max : number){
	for(let i = min; i <= max; ++i){
		bitset.set(i);
	}
}

function addRange(bitset : RawBitSet, list : LongRangeList, min : number, max : number){
	regBitset(bitset, min, max);
	list.addRange(min, max);
}

describe('LongRange test', () => {
    it('addSimpleRange', () => {
        let list = new LongRangeList();

        list.addRange(10);
        let it = list.iterator();

        while(it.hasNext()){
            let val = it.next();
            expect(val == 10).toBe(true);
        }
    })

    it('emptyIterator', () => {
        let list = new LongRangeList();

        let it = list.iterator();

        while(it.hasNext()){
            let val = it.next();
        }
    })

    it('addSimpleRange02', () => {
        let bitset = new RawBitSet(128);

        let list = new LongRangeList();

        addRange(bitset, list, 10, 15);
        addRange(bitset, list, 1, 2);

        let pos = bitset.nextSetBit(0);

        let it = list.iterator();
        while(it.hasNext()){
            let val = it.next();
            expect(val == pos).toBe(true);

            pos = bitset.nextSetBit(pos + 1);
        }
    })
})
