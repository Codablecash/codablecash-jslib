import { off } from "node:cluster";
import { IComparable } from "../base/IComparable";
import { FileDescriptor } from "../osenv/FileDescriptor";
import { FileIOException } from "../osenv/FileIOException";
import { Os, SeekOrigin } from "../osenv/Os";
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

    public getPosition() : number {
        return this.position;
    }

    public isDirty() : boolean {
        return this.dirty;
    }

    public async writeBack(fd : FileDescriptor) : Promise<number> {
        let ret = Os.seekFile(fd, this.position, SeekOrigin.FROM_BEGINING);

        ret = await Os.write2File(fd, this.buffer, this.mappedSize);
        if(ret != this.mappedSize){
            throw new FileIOException("Failed in writing a segment.");
        }
        this.dirty = false;

        return ret;
    }

    public segmentSize() : number {
        return this.mappedSize;
    }

    public requestCacheOut() : void {
        this.parent.requestCacheOut(this);
    }

    public async loadData(fd : FileDescriptor) : Promise<void> {
        let ret = Os.seekFile(fd, this.position, SeekOrigin.FROM_BEGINING);

        ret = await Os.readFile(fd, this.buffer, this.mappedSize);
        if(ret != this.mappedSize){
            throw new FileIOException("Failed in writing a segment.");
        }
    }

    public getPtr2Read(offset : number, count : number) : Uint8Array<ArrayBuffer>{
        let size = this.buffer.length - offset;

        let ptr = this.buffer.slice(offset, offset + count);
        return ptr;
    }

    public getPtr() : Uint8Array {
        return this.buffer;
    }

    public remains(offset : number) : number {
        return this.mappedSize - offset;
    }

    public setDirty(bl : boolean) : void {
        this.dirty = bl;
    }
}
