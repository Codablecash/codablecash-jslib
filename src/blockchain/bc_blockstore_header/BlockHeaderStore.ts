import { CFile } from "../../db/base_io/CFile";
import { VariableBlockFileStore } from "../../db/filestore_variable_block/VariableBlockFileStore";
import { DiskCacheManager } from "../../db/random_access_file/DiskCacheManager";

export class BlockHeaderStore {
	private index : number;
	private baseDir : CFile;
	private cacheManager : DiskCacheManager;
	private store : VariableBlockFileStore | null;

    constructor(index : number, baseDir : CFile, cacheManager : DiskCacheManager) {
        this.index = index;
        this.baseDir = baseDir;
        this.cacheManager = cacheManager;
        this.store = null;       
    }
}