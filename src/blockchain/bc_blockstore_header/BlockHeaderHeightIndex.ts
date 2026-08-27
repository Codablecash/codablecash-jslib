import { CFile } from "../../db/base_io/CFile";
import { Btree } from "../../db/btree/Btree";
import { DiskCacheManager } from "../../db/random_access_file/DiskCacheManager";

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
}