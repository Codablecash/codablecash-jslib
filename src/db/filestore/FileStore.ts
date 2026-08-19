import { CFile } from "../base_io/CFile";
import { DiskCacheManager } from "../random_access_file/DiskCacheManager";
import { RandomAccessFile } from "../random_access_file/RandomAccessFile";


export class FileStore {
    protected cacheManager : DiskCacheManager;
    protected file : RandomAccessFile | null;
    protected headerFile : RandomAccessFile | null;
    protected dir : string;
    protected name : string;

    constructor(dir : string, name : string, cacheManager : DiskCacheManager){
        this.cacheManager = cacheManager;

        this.headerFile = null;
        this.file = null;

        this.dir = dir;
        this.name = name;
    }

    public exists() {
        let baseDir = new CFile(this.dir);

        let filename = this.name + ".bin";
        let storeFile = baseDir.get(filename);
        let body = new RandomAccessFile(storeFile, this.cacheManager);

        let headerfilename = this.name + "-header.bin";
        let storeHeaderFile = baseDir.get(headerfilename);
        let header = new RandomAccessFile(storeHeaderFile, this.cacheManager);

        return body.exists() && header.exists();
    }

    public __createStore(del : boolean, defaultSize : number) {
        let baseDir = new CFile(this.dir);
        if(!baseDir.exists()){
            baseDir.mkdirs();
        }

        if(del){
            this.deleteLastFiles(baseDir);
        }

        this.openFile(baseDir, false);
        this.file?.setLength(defaultSize);

        this.openHeaderFile(baseDir, false);

        this.close();
    }

    public deleteFiles() {
        let baseDir = new CFile(this.dir);
        this.deleteLastFiles(baseDir);
    }

    protected deleteLastFiles(baseDir : CFile){
        let filename = this.name + ".bin";
        let storeFile = baseDir.get(filename);
        if(storeFile.exists()){
            storeFile.deleteFile();
        }

        let headerfilename = this.name + "-header.bin";
        let storeHeaderFile = baseDir.get(headerfilename);
        if(storeHeaderFile.exists()){
            storeHeaderFile.deleteFile();
        }
    }

    public __open(sync : boolean) : void {
        let baseDir = new CFile(this.dir);

        this.openFile(baseDir, sync);
        this.openHeaderFile(baseDir, sync);
    }

    public openFile(baseDir : CFile, sync : boolean) : void {
        let filename = this.name + ".bin";
        let storeFile = baseDir.get(filename);

        this.file = new RandomAccessFile(storeFile, this.cacheManager);
        this.file.open(sync);
    }

    public openHeaderFile(baseDir : CFile, sync : boolean) : void {
        let headerfilename = this.name + "-header.bin";
        let storeHeaderFile = baseDir.get(headerfilename);

        this.headerFile = new RandomAccessFile(storeHeaderFile, this.cacheManager);
        this.headerFile.open(sync);
    }

    public isOpened() : boolean {
        return this.file != null;
    }

    public close() {
        if(this.headerFile != null){
            this.headerFile.close();
            this.headerFile = null;
        }

        if(this.file != null){
            this.file.close();
            this.file = null;
        }
    }
}
