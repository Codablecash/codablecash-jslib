import { NullPointerException } from "../base/NullPointerException";
import { CFile } from "../base_io/CFile";
import { BtreeKeyFactory } from "../btreekey/BtreeKeyFactory";
import { IBlockObject } from "../filestore_block/IBlockObject";
import { DiskCacheManager } from "../random_access_file/DiskCacheManager";
import { AbstractBtreeDataFactory } from "./AbstractBtreeDataFactory";
import { AbstractBtreeKey } from "./AbstractBtreeKey";
import { BtreeConfig } from "./BtreeConfig";
import { BtreeStorage } from "./BtreeStorage";
import { NodeCursor } from "./NodeCursor";

export class BtreeOpenConfig {
    public numDataBuffer : number;
    public numNodeBuffer : number;

    constructor(){
        this.numDataBuffer = 256;
        this.numNodeBuffer = 512;
    }
}

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

    public static clearFiles(folder : CFile, name : string) {
        let headerName = name + "-header.bin";
        let bodyName = name + ".bin";

        let headerFile = folder.get(headerName);
        let bodyFile = folder.get(bodyName);

        headerFile.deleteFile();
        bodyFile.deleteFile();
    }

    public static renameFiles(folder : CFile, lastName : string, newName : string) {
        let headerName = lastName + "-header.bin";
        let bodyName = lastName + ".bin";
  
        let headerFile = folder.get(headerName);
        let bodyFile = folder.get(bodyName);

        let newHeaderName = newName + "-header.bin";
        let newBodyName = newName + ".bin";

        let newHeaderFile = folder.get(newHeaderName);
        let newBodyFile = folder.get(newBodyName);

        headerFile.move(newHeaderFile);
        bodyFile.move(newBodyFile);
    }

    public open(config : BtreeOpenConfig) {
        this.store = new BtreeStorage(this.folder, this.name, this.factory, this.dfactory);

        this.store.open(config.numDataBuffer, config.numNodeBuffer, this.cacheManager);

        {
            let header = this.store.loadHeader();

            this.store.setRootFpos(header.getRootFpos());
            this.config = header.getConfig();
        }
    }

    public close() : void {
        this.store?.close();
    }

    public putData(key : AbstractBtreeKey, data : IBlockObject) {
        if(this.store != null && this.config != null){
            let rootNode = this.store.loadRoot();

            let cursor = new NodeCursor(rootNode, this.store, this.config.nodeNumber);
            cursor.insert(key, data);
        }
    }

    public findByKey(key : AbstractBtreeKey) : IBlockObject | null {
        if(this.store != null && this.config != null){
            let rootNode = this.store.loadRoot();
            let cursor = new NodeCursor(rootNode, this.store, this.config.nodeNumber);

            return cursor.find(key);
        }
        throw new NullPointerException("Btree.findByKey()");
    }
    
}