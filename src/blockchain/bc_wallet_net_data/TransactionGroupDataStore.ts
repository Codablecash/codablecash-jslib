import { NullPointerException } from "../../db/base/NullPointerException";
import { CFile } from "../../db/base_io/CFile";
import { Btree, BtreeOpenConfig } from "../../db/btree/Btree";
import { BtreeConfig } from "../../db/btree/BtreeConfig";
import { DiskCacheManager } from "../../db/random_access_file/DiskCacheManager";
import { BlockHeaderId } from "../bc_block/BlockHeaderId";
import { BlockHeaderIdKey } from "../bc_blockstore_header/BlockHeaderIdKey";
import { BlockHeaderIdKeyFactory } from "../bc_blockstore_header/BlockHeaderIdKeyFactory";
import { HeaderTransactionGroup } from "./HeaderTransactionGroup";
import { HeaderTransactionGroupDataFactory } from "./HeaderTransactionGroupDataFactory";


export class TransactionGroupDataStore {
    public static readonly FILE_NAME = "unfinalized_data";

    private baseDir : CFile;
	private cacheManager : DiskCacheManager;
	private headerGroupStore : Btree | null;

    constructor(baseDir : CFile) {
        this.baseDir = baseDir;
        this.cacheManager = new DiskCacheManager();
        this.headerGroupStore = null;        
    }

    public initBlank() : void {
        let fileName = TransactionGroupDataStore.FILE_NAME;

        let keyFactory = new BlockHeaderIdKeyFactory();
        let dataFactory = new HeaderTransactionGroupDataFactory();

        let btree = new Btree(this.baseDir, fileName, this.cacheManager, keyFactory, dataFactory);

        let config = new BtreeConfig();
        config.nodeNumber = 8;
        config.defaultSize = 1024;
        config.blockSize = 32;
        btree.create(config);
    }

    public open() : void {
        let fileName = TransactionGroupDataStore.FILE_NAME;

        let keyFactory = new BlockHeaderIdKeyFactory();
        let dataFactory = new HeaderTransactionGroupDataFactory();

        this.headerGroupStore = new Btree(this.baseDir, fileName, this.cacheManager, keyFactory, dataFactory);

        let opconf = new BtreeOpenConfig();
        opconf.numDataBuffer = 256;
        opconf.numNodeBuffer = 512;
        this.headerGroupStore.open(opconf);
    }

    public close() : void {
        if(this.headerGroupStore != null){
            this.headerGroupStore.close();
            this.headerGroupStore = null;
        }
    }

    public add(headerId : BlockHeaderId, group : HeaderTransactionGroup) : void {
        if(this.headerGroupStore != null){
            let key = new BlockHeaderIdKey(headerId);

            this.headerGroupStore.putData(key, group);
        }
    }

    public getHeaderTransactionGroup(headerId : BlockHeaderId) : HeaderTransactionGroup {
        if(this.headerGroupStore != null){
            let key = new BlockHeaderIdKey(headerId);

            let object = this.headerGroupStore.findByKey(key);
            let trxGroup = <HeaderTransactionGroup>(object);

            return trxGroup;
        }
        throw new NullPointerException("TransactionGroupDataStore.getHeaderTransactionGroup()");
    }

    public removeHeaderTransactionGroup(headerId : BlockHeaderId) : boolean {
        if(this.headerGroupStore != null){
            let key = new BlockHeaderIdKey(headerId);

            let ret = this.headerGroupStore.remove(key);
            return ret;
        }
        throw new NullPointerException("TransactionGroupDataStore.removeHeaderTransactionGroup()");
    }
}