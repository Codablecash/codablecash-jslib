import { InfinityKey } from "../../../db/btreekey/InfinityKey"
import { NullKey } from "../../../db/btreekey/NullKey";
import { ULongKey } from "../../../db/btreekey/ULongKey";

describe('TestBTreeGroup', () => {
    it('infinityKey', () => {
        let key = new InfinityKey();
        let key2 = <InfinityKey>key.clone();
        let ulkey = new ULongKey(100);

        expect(key.compareTo(key2)).toBe(0);
        expect(key.compareTo(ulkey) > 0).toBe(true);
        expect(ulkey.compareTo(key) < 0).toBe(true);

        expect(!key.isNull()).toBe(true);
        expect(!ulkey.isNull()).toBe(true);
    })

    it('nullkey', () => {
        let key = new NullKey();
        let key2 = <NullKey>key.clone();
        let ulkey = new ULongKey(100);

        expect(key.compareTo(key2)).toBe(0);
        expect(key.compareTo(ulkey) < 0).toBe(true);
        expect(ulkey.compareTo(key) > 0).toBe(true);
    })
})
