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

    public open(sync : boolean) {
        this.fd = Os.openFile2ReadWrite(this.file, sync);

        if(!this.fd.isOpened()){
            throw new FileIOException("Failed in opening file");
        }

        this.position = 0;
        this.fileSize = this.file.length();

        let segmentSize = this.getSegmentSize();
	    this.mmapSegments = new MMapSegments(this.fileSize, segmentSize);

        if(this.fileSize == 0){
            this.setLength(this.pageSize * RandomAccessFile.PAGE_NUM_CACHE);
        }
    }

    public close() {
        if(this.fd != null && !this.fd.isOpened()) {
            return;
        }

        if(this.mmapSegments != null && this.fd != null){
            this.mmapSegments.clearElements(this.diskCacheManager, this.fd);
            Os.closeFileDescriptor(this.fd);
        }
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

}