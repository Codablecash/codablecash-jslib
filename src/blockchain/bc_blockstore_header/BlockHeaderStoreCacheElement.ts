import { IComparable } from "../../db/base/IComparable";
import { CFile } from "../../db/base_io/CFile";
import { DiskCacheManager } from "../../db/random_access_file/DiskCacheManager";
import { BlockHeaderHeightIndex } from "./BlockHeaderHeightIndex";
import { BlockHeaderStore } from "./BlockHeaderStore";

export class BlockHeaderStoreCacheElement implements IComparable {
	private index : number;
	private baseDir : CFile;
	private cacheManager : DiskCacheManager;

	private store : BlockHeaderStore | null;
	private heightIndex : BlockHeaderHeightIndex | null;

    constructor(baseDir : CFile, index : number){
        this.baseDir = baseDir;
        this.index = index;

        this.cacheManager = new DiskCacheManager();
        this.store = null;
        this.heightIndex = null;
    }

    compareTo(other: IComparable | null): number {
        if(other == null){
            return 1;
        }
        
        let o = <BlockHeaderStoreCacheElement>other;
        return this.index - o.index;
    }



}