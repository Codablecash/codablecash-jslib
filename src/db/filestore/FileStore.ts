import { CFile } from "../base_io/CFile";
import { DiskCacheManager } from "../random_access_file/DiskCacheManager";
import { RandomAccessFile } from "../random_access_file/RandomAccessFile";


export class FileStore {
    private cacheManager : DiskCacheManager;
    private file : RandomAccessFile | null;
    private headerFile : RandomAccessFile | null;
    private dir : string;
    private name : string;

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

    public createStore(del : boolean, defaultSize : number){
        let baseDir = new CFile(this.dir);
        if(!baseDir.exists()){
            baseDir.mkdirs();
        }

        if(del){
            this.deleteLastFiles(baseDir);
        }


    }

    public deleteFiles() {
        let baseDir = new CFile(this.dir);
        this.deleteLastFiles(baseDir);
    }

    private deleteLastFiles(baseDir : CFile){
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

    
}
