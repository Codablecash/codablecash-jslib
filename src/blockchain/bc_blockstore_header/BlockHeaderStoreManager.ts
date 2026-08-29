import { ArrayList } from "../../db/base/ArrayList";
import { CFile } from "../../db/base_io/CFile";
import { BlockHeader } from "../bc_block/BlockHeader";
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
/*
    bool BlockHeaderStoreManager::isEmpty() const noexcept {
        BlockHeaderStoreCacheElement* cache = this.cache.getHeaderStoreCacheElement(1, false);
        return cache == nullptr;
    }

    ArrayList<BlockHeader>* BlockHeaderStoreManager::getChildrenOf(const BlockHeaderId *headerId, uint64_t height) {
        StackReadLock __lock(this.rwLock, __FILE__, __LINE__);

        BlockHeaderStoreCacheElement* cache = this.cache.getHeaderStoreCacheElement(height, false);
        return cache != nullptr ? cache.getChildrenOf(headerId, height) : new ArrayList<BlockHeader>();
    }


    void BlockHeaderStoreManager::removeHeader(const BlockHeaderId *hash, uint64_t height) {
        StackWriteLock __lock(this.rwLock, __FILE__, __LINE__);

        BlockHeaderStoreCacheElement* cache = this.cache.getHeaderStoreCacheElement(height, false);
        if(cache == nullptr){
            return;
        }

        cache.removeBlock(hash, height);
    }

    BlockHeader* BlockHeaderStoreManager::getHeader(const BlockHeaderId *headerId, uint64_t height) {
        StackReadLock __lock(this.rwLock, __FILE__, __LINE__);

        return __getHeader(headerId, height);
    }

    BlockHeader* BlockHeaderStoreManager::__getHeader(const BlockHeaderId* headerId, uint64_t height) {
        if(height < 1 || headerId.bufferIsNull()){
            return nullptr;
        }

        ArrayList<BlockHeader>* list = __getBlocksAtHeight(height); __STP(list);
        if(list == nullptr){
            return nullptr;
        }
        list.setDeleteOnExit();

        BlockHeader* ret = nullptr;

        int maxLoop = list.size();
        for(int i = 0; i != maxLoop; ++i){
            BlockHeader* header = list.get(i);
            const BlockHeaderId* id = header.getId();
            if(id.equals(headerId)){
                ret = list.remove(i);
                break;
            }
        }

        return ret;
    }

    BlockHeader* BlockHeaderStoreManager::getNBlocksBefore(const BlockHeaderId *headerId, uint64_t height, int beforeNBlocks) {
        BlockHeader* currentHeader = __getHeader(headerId, height);

        // ExceptionThrower<BlockHeaderNotFoundException>::throwExceptionIfCondition(currentHeader == nullptr, L"The currentHeader does not found.", __FILE__, __LINE__);

        uint64_t currentHeight = height;
        for(int i = 0; i != beforeNBlocks; ++i){
            __STP(currentHeader);
            currentHeader = __getHeader(currentHeader.getLastHeaderId(), currentHeader.getHeight() - 1);
        }

        return currentHeader;
    }

    void BlockHeaderStoreManager::finalize(uint64_t height,	const BlockHeaderId *headerId, IHeaderRemovalNotifier* notifier) {
        StackWriteLock __lock(this.rwLock, __FILE__, __LINE__);

        BlockHeaderStoreCacheElement* cache = this.cache.getHeaderStoreCacheElement(height, false);
        cache.finalize(height, headerId, notifier);
    }
*/
    // TODO implement
}