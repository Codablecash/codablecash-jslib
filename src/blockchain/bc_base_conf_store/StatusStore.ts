import { CFile } from "../../db/base_io/CFile";
import { DiskCacheManager } from "../../db/random_access_file/DiskCacheManager";
import { RandomAccessFile } from "../../db/random_access_file/RandomAccessFile";
import { AbstractConfigStoreElement } from "./AbstractConfigStoreElement";

export class StatusStore {
    private file: CFile;
    private baseDir: CFile;
    private diskCacheManager : DiskCacheManager;
    private store : RandomAccessFile | null;
    private map : Map<string, AbstractConfigStoreElement>;

    constructor(baseDir : CFile, name : string){
        this.baseDir = baseDir;
        this.file = this.baseDir.get(name);
        this.store = null;
        this.map = new Map<string, AbstractConfigStoreElement>();

        this.diskCacheManager = new DiskCacheManager();
    }

    public exists() : boolean {
        return this.file.exists();
    }

    public open() : void {
        if(!this.baseDir.exists()){
            this.baseDir.mkdirs();
        }

        this.store = new RandomAccessFile(this.file, this.diskCacheManager);
        this.store.open(false);
    }

    public close() : void {
        if(this.store != null){
            this.store.close();
            this.store = null;
        }
    }
    
}