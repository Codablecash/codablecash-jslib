import { CFile } from "../base_io/CFile";
import { NodeCache } from "../btree_cache/NodeCache";
import { BtreeKeyFactory } from "../btreekey/BtreeKeyFactory";
import { IBlockFileStore } from "../filestore_block/IBlockFileStore";
import { AbstractBtreeDataFactory } from "./AbstractBtreeDataFactory";


export class BtreeStorage {
    private name : string;
    private folder : CFile;
    private factory : BtreeKeyFactory;
    private dfactory : AbstractBtreeDataFactory;

    private store : IBlockFileStore | null
    private cache : NodeCache | null;
    private rootFpos : number;
    
    constructor(folder : CFile, name : string, factory : BtreeKeyFactory, dfactory : AbstractBtreeDataFactory){
        this.name = name;
        this.folder = folder;
        this.factory = factory;
        this.dfactory = dfactory;

        this.store = null;
        this.cache = null;

        this.rootFpos = 0;
    }

    public close(){
        if(this.store != null){
            this.store.close();
        }
        if(this.cache != null){
            this.cache.clear();
        }
    }
}