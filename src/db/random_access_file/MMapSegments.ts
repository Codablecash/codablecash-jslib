import { ArrayList } from "../base/ArrayList";
import { RawLinkedListElement } from "../base/RawLinkedList";
import { MMapSegment } from "./MMapSegment";


export class MMapSegments {
    protected segIndex : ArrayList<RawLinkedListElement<MMapSegment>>;
    protected numSegments : number;
    protected segmentSize : number;
    protected fileSize : number;

    constructor(fileSize : number, segmentSize : number) {
        this.fileSize = fileSize;
        this.segmentSize = segmentSize;

        this.numSegments = this.getNumSegments(fileSize, segmentSize);

        this.segIndex = new ArrayList<RawLinkedListElement<MMapSegment>>(this.numSegments);
        for(let i = 0; i != this.numSegments; ++i){
            this.segIndex.addElement(null);
        }
    }

    private getNumSegments(fileSize : number, segmentSize : number) : number {
        return (fileSize % segmentSize) == 0 ? fileSize / segmentSize : (fileSize / segmentSize) + 1;
    }
}
