import { CFile } from "../base_io/CFile";
import { BtreeKeyFactory } from "../btreekey/BtreeKeyFactory";
import { DiskCacheManager } from "../random_access_file/DiskCacheManager";
import { AbstractBtreeDataFactory } from "./AbstractBtreeDataFactory";
import { BtreeConfig } from "./BtreeConfig";
import { BtreeStorage } from "./BtreeStorage";


export class Btree {
    private folder : CFile;
    private name : string;
    private factory : BtreeKeyFactory;
    private dfactory : AbstractBtreeDataFactory;

    private store : BtreeStorage | null;
    private cacheManager : DiskCacheManager;
    private config : BtreeConfig | null;

    constructor(folder : CFile, name : string, cacheManager : DiskCacheManager, factory : BtreeKeyFactory, dfactory : AbstractBtreeDataFactory){
        this.folder = folder;
        this.name = name;
        this.factory = factory;
        this.dfactory = dfactory;

        this.store = null;
        this.cacheManager = cacheManager;
        this.config = null;
    }

    public exists() : boolean {
        let newStore = new BtreeStorage(this.folder, this.name, this.factory, this.dfactory);
        return newStore.exists();
    }

    public create(config : BtreeConfig) {
        let newStore = new BtreeStorage(this.folder, this.name, this.factory, this.dfactory);

        newStore.create(this.cacheManager, config);  
    }
}