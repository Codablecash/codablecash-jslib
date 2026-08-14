import { kMaxLength } from "node:buffer";
import { ArrayList } from "../base/ArrayList";
import { RawLinkedListElement } from "../base/RawLinkedList";
import { FileDescriptor } from "../osenv/FileDescriptor";
import { DiskCacheManager } from "./DiskCacheManager";
import { MMapSegment } from "./MMapSegment";


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

    public async clearElements(diskManager : DiskCacheManager, fd : FileDescriptor) {
        await this.cacheOutSegmentIndex(fd);

        let maxLoop = this.segIndex.size();
        for(let i = 0; i != maxLoop; ++i){
            let seg : RawLinkedListElement<MMapSegment> | null = this.segIndex.get(i);

            if(seg != null){
                let data = seg.data;

                if(data?.isDirty()){
                    data.writeBack(fd);
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
}