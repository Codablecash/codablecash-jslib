import { NullPointerException } from "../../db/base/NullPointerException";
import { CFile } from "../../db/base_io/CFile";
import { Btree, BtreeOpenConfig } from "../../db/btree/Btree";
import { BtreeConfig } from "../../db/btree/BtreeConfig";
import { NullKey } from "../../db/btreekey/NullKey";
import { DiskCacheManager } from "../../db/random_access_file/DiskCacheManager";
import { BlockHeaderHeightIndexDataFactory } from "./BlockHeaderHeightIndexDataFactory";
import { BlockHeaderHeightIndexKey } from "./BlockHeaderHeightIndexKey";
import { BlockHeaderHeightIndexKeyFactory } from "./BlockHeaderHeightIndexKeyFactory";
import { BlockHeaderList } from "./BlockHeaderList";

export class BlockHeaderHeightIndex {
    public static FILE_NAME = "height_idx";

	private index : number;
	private baseDir : CFile;
	private cacheManager : DiskCacheManager;
	private btree : Btree | null;

    constructor(index : number, baseDir : CFile, cacheManager : DiskCacheManager) {
        this.index = index;
        this.baseDir = baseDir;
        this.cacheManager = cacheManager;
        this.btree = null;
    }

    public exists() : boolean {
        let fileName = BlockHeaderHeightIndex.FILE_NAME;
        fileName = this.addIdex2String(fileName);

        let keyFactory = new BlockHeaderHeightIndexKeyFactory();
        let dataFactory = new BlockHeaderHeightIndexDataFactory();

        let btree = new Btree(this.baseDir, fileName, this.cacheManager, keyFactory, dataFactory);

        let ex = btree.exists();

        return ex;
    }

    public create() : void {
        let fileName = BlockHeaderHeightIndex.FILE_NAME;
        fileName = this.addIdex2String(fileName);

        let keyFactory = new BlockHeaderHeightIndexKeyFactory();
        let dataFactory = new BlockHeaderHeightIndexDataFactory();

        let btree = new Btree(this.baseDir, fileName, this.cacheManager, keyFactory, dataFactory);

        let config = new BtreeConfig();
        config.nodeNumber = 8;
        config.defaultSize = 1024;
        config.blockSize = 32;
        btree.create(config);
    }

    public open() : void {
        let fileName = BlockHeaderHeightIndex.FILE_NAME;
        fileName = this.addIdex2String(fileName);

        let keyFactory = new BlockHeaderHeightIndexKeyFactory();
        let dataFactory = new BlockHeaderHeightIndexDataFactory();

        this.btree = new Btree(this.baseDir, fileName, this.cacheManager, keyFactory, dataFactory);

        let opconf = new BtreeOpenConfig();
        opconf.numDataBuffer = 256;
        opconf.numNodeBuffer = 512;
        this.btree.open(opconf);
    }

    public close() : void {
        if(this.btree != null){
            this.btree.close();
            this.btree = null;
        }
    }

    public addIdex2String(str : string) : string {
        let num : string = this.index.toString(10).padStart(8, "0");

        return str + num;
    }

    public addHeader(height : number, fpos : number) : void {
        if(this.btree != null){
            let key = new BlockHeaderHeightIndexKey(height);

            let headers = new BlockHeaderList();
            headers.add(fpos);

            this.btree.putData(key, headers);
            return;
        }
        throw new NullPointerException("BlockHeaderHeightIndex.addHeader()");
    }

    public getHeadersAtHeight(height : number) : BlockHeaderList | null {
        if(this.btree != null){
            let key = new BlockHeaderHeightIndexKey(height);

            let obj = this.btree.findByKey(key);
            if(obj == null){
                return null;
            }

            let list = <BlockHeaderList>(obj);

            return list;
        }
        throw new NullPointerException("BlockHeaderHeightIndex.getHeadersAtHeight()");
    }

    public removeIndex(height : number, fpos : number) : void {
        if(this.btree != null){
            let key = new BlockHeaderHeightIndexKey(height, fpos);

            this.btree.remove(key);
        }
        throw new NullPointerException("BlockHeaderHeightIndex.removeIndex()");
    }
}