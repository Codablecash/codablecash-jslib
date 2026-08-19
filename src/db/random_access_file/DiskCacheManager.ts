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
        this.cache.removeElement(seg);
    }

    public registerCache(newSeg : MMapSegment) : RawLinkedListElement<MMapSegment> | null {
        if(this.maxCache <= this.currentSize){
            let outSeg = this.cache.getLastElement();
            
            // request delete from segment index
            if(outSeg != null && outSeg.data != null){
                let segdata = outSeg.data;
                segdata.requestCacheOut();
                this.currentSize -= segdata.segmentSize();

                this.cache.removeByIndex(this.cache.size() - 1);
            }
        }

        let newElement = this.cache.__add(0, newSeg);
        this.currentSize += newSeg.segmentSize();

        return newElement;
    }
 
    public size() : number {
        return this.currentSize;
    }
}
