import { RawLinkedList, RawLinkedListElement } from "../base/RawLinkedList";
import { MMapSegment } from "./MMapSegment";

export class DiskCacheManager {
    private cache : RawLinkedList<MMapSegment>;
    private maxCache : number;
    private currentSize : number;

    constructor(maxCache : number = (4096 * 4 * 4)){
        this.cache = new RawLinkedList<MMapSegment>();
        this.maxCache = maxCache;
        this.currentSize = 0;
    }

    public fireCacheHit(seg : RawLinkedListElement<MMapSegment>) : void {
        this.cache.moveElementToTop(seg);
    }

    public fireCacheRemoved(seg : RawLinkedListElement<MMapSegment>) : void {
        let data = seg.data;
        this.currentSize -= (data != null) ? data.segmentSize() : 0;
        this.cache.remove(seg);
    }
}
