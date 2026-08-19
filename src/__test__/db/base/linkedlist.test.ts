import { Integer } from "../../../db/base/Integer";
import { RawLinkedList } from "../../../db/base/RawLinkedList";


describe('Raw Linked List test', () => {
    it('construct', () => {
        let list = new RawLinkedList<Integer>();

        expect(list.size()).toBe(0);
    })

    it('add01', () => {
        let ar = new RawLinkedList<Integer>();

        ar.add(new Integer(0));
        expect(ar.size()).toBe(1);

        let size = ar.size();
        for(let i = 0; i != size; ++i){
            let ptr = ar.get(i);
            expect(ptr != null).toBe(true);
        }
    })

    it('testMoveElementToTop01', () => {
        let list = new RawLinkedList<Integer>();

        let maxLoop = 3;
        for(let i = 0; i != maxLoop; ++i){
            let ptr = new Integer(i);
            list.add(ptr);
        }

        var last = list.getLastElement();
        if(last != null){
            let el = last.prev;

            expect(el != null).toBe(true);
            if(el != null){
                list.moveElementToTop(el);
            }
            
            let ptr = list.get(0);
            expect(ptr?.getValue()).toBe(1);
            ptr = list.get(1);
            expect(ptr?.getValue()).toBe(0);
            ptr = list.get(2);
            expect(ptr?.getValue()).toBe(2);
        }

        for(let i = 0; i != maxLoop; ++i){
            let ptr = list.get(0);
            expect(ptr != null).toBe(true);

            if(ptr != null){
                let c = list.remove(ptr);
                expect(c).toBe(true);
            }
            
        }
    }) 
})
