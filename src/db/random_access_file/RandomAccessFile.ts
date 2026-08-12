import { CFile } from "../base_io/CFile";
import { FileDescriptor } from "../osenv/FileDescriptor";
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

    constructor(file : CFile, diskCacheManager : DiskCacheManager, pageSize : number){
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
}