import { MMapSegments } from "./MMapSegments";


export class MMapSegment {
    protected mappedSize : number;
    protected position : number;
    protected buffer : Uint8Array;
    protected parent : MMapSegments;
    protected dirty : boolean;

    constructor(mappedSize : number, position : number, parent : MMapSegments){
        this.mappedSize = mappedSize;
        this.position = position;
        this.buffer = new Uint8Array(this.mappedSize);
        this.parent = parent;
        this.dirty = false;
    }

    
}
