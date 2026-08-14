import { kMaxLength } from "node:buffer";
import { ArrayList } from "../base/ArrayList";
import { RawLinkedListElement } from "../base/RawLinkedList";
import { FileDescriptor } from "../osenv/FileDescriptor";
import { DiskCacheManager } from "./DiskCacheManager";
import { MMapSegment } from "./MMapSegment";
import { FileIOException } from "../osenv/FileIOException";


export class MMapSegments {
    protected segIndex : ArrayList<RawLinkedListElement<MMapSegment>>;
    protected numSegments : number;
    protected segmentSize : number;
    protected fileSize : number;

    protected removeList : ArrayList<MMapSegment>;

    constructor(fileSize : number, segmentSize : number) {
        this.fileSize = fileSize;
        this.segmentSize = segmentSize;

        this.numSegments = this.getNumSegments(fileSize, segmentSize);

        this.segIndex = new ArrayList<RawLinkedListElement<MMapSegment>>(this.numSegments);
        for(let i = 0; i != this.numSegments; ++i){
            this.segIndex.addElement(null);
        }

        this.removeList = new ArrayList<MMapSegment>(64);
    }

    private getNumSegments(fileSize : number, segmentSize : number) : number {
        return (fileSize % segmentSize) == 0 ? fileSize / segmentSize : (fileSize / segmentSize) + 1;
    }

    public async onResized(fileSize : number, fd : FileDescriptor, diskManager : DiskCacheManager) : Promise<void> {
        await this.cacheOutSegmentIndex(fd);

        let lastTopSegment = this.segIndex.size() - 1;

        let newNumSegments = this.getNumSegments(fileSize, this.segmentSize);

        let diffSize = newNumSegments - this.numSegments;
        for(let i = 0; i != diffSize; ++i){
            this.segIndex.addElement(null);
        }

        this.numSegments = newNumSegments;
        this.fileSize = fileSize;

        // hadle last seg
        if(lastTopSegment < 0 || this.segIndex.get(lastTopSegment) == null){
            return;
        }

        let segElement = this.segIndex.get(lastTopSegment);
        if(segElement != null && segElement.data != null && segElement.data.isDirty()){
            let seg = segElement.data;
            await seg.writeBack(fd);
        }

        this.segIndex.setElement(null, lastTopSegment);
        if(segElement != null){
            diskManager.fireCacheRemoved(segElement);
        }
    }

    public async clearElements(diskManager : DiskCacheManager, fd : FileDescriptor) {
        await this.cacheOutSegmentIndex(fd);

        let maxLoop = this.segIndex.size();
        for(let i = 0; i != maxLoop; ++i){
            let seg : RawLinkedListElement<MMapSegment> | null = this.segIndex.get(i);

            if(seg != null){
                let data = seg.data;

                if(data?.isDirty()){
                    await data.writeBack(fd);
                }

                diskManager.fireCacheRemoved(seg);
            }
        }
    }

    private async cacheOutSegmentIndex(fd : FileDescriptor) {
        let maxLoop = this.removeList.size();
        for(let i = 0; i != maxLoop; ++i){
            let seg = this.removeList.get(i);

            let index = (seg != null ? seg.getPosition() : 0) / this.segmentSize;
            this.segIndex.setElement(null, index);

            if(seg?.isDirty() == true){
                await seg.writeBack(fd);
            }
        }

        this.removeList.reset();
    }

    public requestCacheOut(seg : MMapSegment) : void {
        this.removeList.addElement(seg);
    }

    public async getSegment(fpos : number, cache : DiskCacheManager, fd : FileDescriptor) : Promise<MMapSegment> {
        if(this.fileSize <= fpos){
            throw new FileIOException("fpos is over the file size.");
        }

        await this.cacheOutSegmentIndex(fd);

        let index = (fpos / this.segmentSize);

        let seg = this.segIndex.get(index);
        if(seg != null && seg.data != null){
            cache.fireCacheHit(seg);
            return seg.data;
        }

        let newSeg = await this.newSegment(fpos, fd);
        let segElement = cache.registerCache(newSeg);
        this.segIndex.setElement(segElement, index);

        return newSeg;       
    }

    public async newSegment(fpos : number, fd : FileDescriptor) : Promise<MMapSegment> {
        let offset = fpos % this.segmentSize;
        let segPos = fpos - offset;

        let segSize = this.fileSize - segPos;
        if(segSize > this.segmentSize){
            segSize = this.segmentSize;
        }

        let seg = new MMapSegment(segSize, segPos, this);
        await seg.loadData(fd);

        return seg;
    }

    public async sync(flushDisk : boolean, fd : FileDescriptor) : Promise<void> {
        await this.cacheOutSegmentIndex(fd);

        let maxLoop = this.segIndex.size();
        for(let i = 0; i != maxLoop; ++i){
            let seg = this.segIndex.get(i);

            if(seg != null && seg.data != null && seg.data.isDirty()){
                let data = seg.data;
                
                await data.writeBack(fd);
            }
        }
    }
}