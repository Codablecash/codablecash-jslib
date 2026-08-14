import { Integer } from "../../../db/base/Integer";
import { RawLinkedList } from "../../../db/base/RawLinkedList";


describe('Raw Linked List test', () => {
    it(' construct', () => {
        let list = new RawLinkedList<Integer>();

        expect(list.size()).toBe(0);
    })
})
