import { off } from "node:cluster";
import { CFile } from "../base_io/CFile";
import { FileDescriptor } from "../osenv/FileDescriptor";
import { FileIOException } from "../osenv/FileIOException";
import { Os, SeekOrigin } from "../osenv/Os";
import { DiskCacheManager } from "./DiskCacheManager";
import { MMapSegments } from "./MMapSegments";


export class RandomAccessFile {
    private file : CFile;
    private position : number;
    private fileSize : number;
    private pageSize : number;
    private diskCacheManager : DiskCacheManager;
    private fd : FileDescriptor | null;
    private mmapSegments : MMapSegments | null;

    private static PAGE_NUM_CACHE = 4;

    constructor(file : CFile, diskCacheManager : DiskCacheManager, pageSize : number = 4096){
        this.position = 0;
        this.fileSize = 0;
        this.diskCacheManager = diskCacheManager;

        this.file = file;
        this.fd = null;
        this.pageSize = pageSize;
        this.mmapSegments = null;
    }

    public exists() : boolean {
        return this.file.exists();
    }

    public async open(sync : boolean) {
        this.fd = Os.openFile2ReadWrite(this.file, sync);

        if(!this.fd.isOpened()){
            throw new FileIOException("Failed in opening file");
        }

        this.position = 0;
        this.fileSize = this.file.length();

        let segmentSize = this.getSegmentSize();
	    this.mmapSegments = new MMapSegments(this.fileSize, segmentSize);

        if(this.fileSize == 0){
            await this.setLength(this.pageSize * RandomAccessFile.PAGE_NUM_CACHE);
        }
    }

    public async close() {
        if(this.fd != null && !this.fd.isOpened()) {
            return;
        }

        if(this.mmapSegments != null && this.fd != null){
            await this.mmapSegments.clearElements(this.diskCacheManager, this.fd);
            Os.closeFileDescriptor(this.fd);
        }
    }

    public async read(fpos : number, buff : Uint8Array, count : number) : Promise<number> {
        let segSize = this.getSegmentSize();

        let buffpos = 0;
        let count2Read = count;
        let currentfpos = fpos;
        while(count2Read > 0 && this.fd != null){
            let seg = await this.mmapSegments?.getSegment(currentfpos, this.diskCacheManager, this.fd);

            if(seg != undefined){
                let offset = currentfpos % segSize;
                //ptr = seg.getPtr(offset);
                let cnt = seg.remains(offset);
                cnt = cnt > count2Read ? count2Read : cnt;

                let ptr = seg.getPtr2Read(offset, cnt);

                buff.set(ptr, buffpos);
                buffpos += cnt;
                count2Read -= cnt;
		        currentfpos += cnt;
            }
        }

        return count;
    }

    public async write(fpos : number, buff : Uint8Array, count : number) : Promise<number>{
        let segSize = this.getSegmentSize();

        let buffoffset = 0;
      	let count2Write = count;
	    let currentfpos = fpos;
        while(count2Write > 0){
            // check capacity
            {
                let currentSize = this.fileSize;
                let writeEndPos = currentfpos + count2Write;
                if(writeEndPos >= currentSize){
                    let newLength = currentSize + this.pageSize * 4;
                    this.setLength(newLength);
                }               
            }

            if(this.mmapSegments != null && this.fd != null){
                let seg = await this.mmapSegments.getSegment(currentfpos, this.diskCacheManager, this.fd);

                let ptr = seg.getPtr();

                let offset = currentfpos % segSize;
                let cnt = seg.remains(offset);
                cnt = cnt > count2Write ? count2Write : cnt;

                // memcpy
                let sl = buff.slice(buffoffset, buffoffset + cnt);
                ptr.set(sl);

                //ptr.set()
                seg.setDirty(true);

                count2Write -= cnt;
                currentfpos += cnt;
                buffoffset += cnt;
            }
        }

        return count;
    }

    public getSegmentSize() : number {
        return this.pageSize * RandomAccessFile.PAGE_NUM_CACHE;
    }

    public async setLength(newLength : number) : Promise<void> {
        if(!this.fd?.isOpened()){
            throw new FileIOException("File is not opened.");
        }
        if(newLength <= this.fileSize){
            return;
        }

        let newSize = newLength - this.fileSize;
        let numBlocks = newSize / this.pageSize;
        let modBytes =  newSize % this.pageSize;

        let fpos = Os.seekFile(this.fd, 0, SeekOrigin.FROM_END);

        let n = 0;
        let tmp = new Uint8Array(this.pageSize);
        tmp.fill(0, 0, this.pageSize);

        for(let i = 0; i != numBlocks; ++i){
            n = await Os.write2File(this.fd, tmp, this.pageSize);

            if(n != this.pageSize){
                throw new FileIOException("filed in writing file.");
            }
        }

        n = await Os.write2File(this.fd, tmp, modBytes);
        if(n != modBytes){
            throw new FileIOException("filed in writing file.");
        }

        let ret = Os.syncFile(this.fd);

        fpos = Os.seekFile(this.fd, 0, SeekOrigin.CURRENT_POS); // get the position of the last

        this.fileSize = fpos;
        await this.mmapSegments?.onResized(this.fileSize, this.fd, this.diskCacheManager);
    }

    public async sync(flashDisk : boolean) : Promise<void> {
        if(this.fd != null){
            await this.mmapSegments?.sync(flashDisk, this.fd);

            if(flashDisk){
                Os.syncFile(this.fd);
            }
        }
        
    }
}