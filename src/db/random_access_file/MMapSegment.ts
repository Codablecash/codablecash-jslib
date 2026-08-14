import { IComparable } from "../base/IComparable";
import { MMapSegments } from "./MMapSegments";


export class MMapSegment implements IComparable {
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

    public compareTo(other : IComparable | null) : number {
        let otherPos = other != null ? (other as MMapSegment).position : 0;

        return this.position - otherPos;
    }
}
