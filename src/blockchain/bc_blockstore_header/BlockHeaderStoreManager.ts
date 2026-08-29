import { CFile } from "../../db/base_io/CFile";
import { BlockHeaderStoreCache } from "./BlockHeaderStoreCache";


export class BlockHeaderStoreManager {
    public static MAIN_HEADER_DIR = "mainheader";

	private baseDir : CFile;
	private sectionLimit : number;

	private cache : BlockHeaderStoreCache;

    constructor(baseDir : CFile, sectionLimit : number) {
        this.baseDir = baseDir.get(BlockHeaderStoreManager.MAIN_HEADER_DIR);

        this.cache = new BlockHeaderStoreCache(this.baseDir, sectionLimit);
        this.sectionLimit = sectionLimit;
    }

    // TODO implement
}