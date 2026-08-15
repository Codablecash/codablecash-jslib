import { LongRangeList } from "../../../db/filestore/LongRangeList"


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
})
