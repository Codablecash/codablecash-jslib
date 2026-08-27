import { RawLinkedList } from "../../db/base/RawLinkedList";
import { CFile } from "../../db/base_io/CFile";
import { BlockHeaderStoreCacheElement } from "./BlockHeaderStoreCacheElement";

export class BlockHeaderStoreCache {
	private baseDir : CFile;
	private sectionLimit : number;
	private maxCache : number;
	private list : RawLinkedList<BlockHeaderStoreCacheElement>;

    constructor(baseDir : CFile, sectionLimit : number) {
        this.baseDir = baseDir;
        this.sectionLimit = sectionLimit;
        this.maxCache = 2;
        this.list = new RawLinkedList<BlockHeaderStoreCacheElement>();
    }
}