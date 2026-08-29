import { ArrayList } from "../../db/base/ArrayList";
import { CFile } from "../../db/base_io/CFile";
import { BlockHeader } from "../bc_block/BlockHeader";
import { BlockHeaderId } from "../bc_block/BlockHeaderId";
import { BlockHeaderStoreCache } from "./BlockHeaderStoreCache";
import { IHeaderRemovalNotifier } from "./IHeaderRemovalNotifier";


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

    public addHeader(header : BlockHeader) : void {
        let height = header.getHeight();
        let cache = this.cache.getHeaderStoreCacheElement(height, true);

        cache.addHeader(header);
    }

    public getBlocksAtHeight(height : number) : ArrayList<BlockHeader> | null{
        return this.__getBlocksAtHeight(height);
    }

    public __getBlocksAtHeight(height : number) : ArrayList<BlockHeader> | null {
        let cache = this.cache.getHeaderStoreCacheElement(height, false);
        return cache != null ? cache.getHeadersAtHeight(height) : null;
    }

    public isEmpty() : boolean {
        let cache = this.cache.getHeaderStoreCacheElement(1, false);
        return cache == null;
    }

    public getChildrenOf(headerId : BlockHeaderId, height : number) : ArrayList<BlockHeader> {
        let cache = this.cache.getHeaderStoreCacheElement(height, false);
        return cache != null ? cache.getChildrenOf(headerId, height) : new ArrayList<BlockHeader>();
    }

    public removeHeader(hash : BlockHeaderId, height : number) {
        let cache = this.cache.getHeaderStoreCacheElement(height, false);
        if(cache == null){
            return;
        }

        cache.removeBlock(hash, height);
    }

    public getHeader(headerId : BlockHeaderId, height : number) : BlockHeader | null {
        return this.__getHeader(headerId, height);
    }

    public __getHeader(headerId : BlockHeaderId, height : number) : BlockHeader | null {
        if(height < 1 || headerId.bufferIsNull()){
            return null;
        }

        let list = this.__getBlocksAtHeight(height);
        if(list == null){
            return null;
        }

        let ret = null;

        let maxLoop = list.size();
        for(let i = 0; i != maxLoop; ++i){
            let header = list.get(i);

            if(header != null){
                let id = header.getId();
                if(id.equals(headerId)){
                    ret = list.remove(i);
                    break;
                }
            }
        }

        return ret;
    }

    public getNBlocksBefore(headerId : BlockHeaderId, height : number, beforeNBlocks : number) : BlockHeader | null{
        let currentHeader = this.__getHeader(headerId, height);

        // ExceptionThrower<BlockHeaderNotFoundException>::throwExceptionIfCondition(currentHeader == nullptr, L"The currentHeader does not found.", __FILE__, __LINE__);

        let currentHeight = height;
        for(let i = 0; currentHeader != null && i != beforeNBlocks; ++i){
            currentHeader = this.__getHeader(currentHeader.getLastHeaderId(), currentHeader.getHeight() - 1);
        }

        return currentHeader;
    }

    public finalize(height : number, headerId : BlockHeaderId, notifier : IHeaderRemovalNotifier) {
        let cache = this.cache.getHeaderStoreCacheElement(height, false);
        cache.finalize(height, headerId, notifier);
    }
}