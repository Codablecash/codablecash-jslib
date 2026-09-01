import { ArrayList } from "../../db/base/ArrayList";
import { IComparable } from "../../db/base/IComparable";
import { NullPointerException } from "../../db/base/NullPointerException";
import { CFile } from "../../db/base_io/CFile";
import { DiskCacheManager } from "../../db/random_access_file/DiskCacheManager";
import { BlockHeader } from "../bc_block/BlockHeader";
import { BlockHeaderId } from "../bc_block/BlockHeaderId";
import { BlockHeaderHeightIndex } from "./BlockHeaderHeightIndex";
import { BlockHeaderList } from "./BlockHeaderList";
import { BlockHeaderStore } from "./BlockHeaderStore";
import { IHeaderRemovalNotifier } from "./IHeaderRemovalNotifier";

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

    public compareTo(other: IComparable | null): number {
        if(other == null){
            return 1;
        }
        
        let o = <BlockHeaderStoreCacheElement>other;
        return this.index - o.index;
    }

	public getIndex() : number {
		return this.index;
	}

    public open() : void {
        this.store = new BlockHeaderStore(this.index, this.baseDir, this.cacheManager);
        this.heightIndex = new BlockHeaderHeightIndex(this.index, this.baseDir, this.cacheManager);

        this.store.open();
        this.heightIndex.open();
    }

    public exist() : boolean {
        let s = new BlockHeaderStore(this.index, this.baseDir, this.cacheManager);
        let h = new BlockHeaderHeightIndex(this.index, this.baseDir, this.cacheManager);

        let storeexist = s.exists();
        let indexexists = h.exists();

        return storeexist && indexexists;
    }

    public create() : void {
        let s = new BlockHeaderStore(this.index, this.baseDir, this.cacheManager);
        let h = new BlockHeaderHeightIndex(this.index, this.baseDir, this.cacheManager);

        s.create();
        h.create();
    }

    public close() : void {
        if(this.store != null){
            this.store.close();
            this.store = null;
        }
        if(this.heightIndex != null){
            this.heightIndex.close();
            this.heightIndex = null;
        }
    }

    public addHeader(header : BlockHeader) : void {
        if(this.store != null && this.heightIndex != null){
            let fpos = this.store.storeHeader(header);

            let height = header.getHeight();
            this.heightIndex.addHeader(height, fpos);
        }
    }

    public getHeadersAtHeight(height : number) : ArrayList<BlockHeader> | null {
        if(this.store != null && this.heightIndex != null){
            let list = this.heightIndex.getHeadersAtHeight(height);

            if(list == null){
                return null;
            }

            let headers = new ArrayList<BlockHeader>();

            let maxLoop = list.size();
            for(let i = 0; i != maxLoop; ++i){
                let fpos = list.get(i);

                let header = this.store.loadHeader(fpos);
                headers.addElement(header);
            }

            return headers;
        }
        throw new NullPointerException("BlockHeaderStoreCacheElement.getHeadersAtHeight()");
    }

    public getChildrenOf(headerId : BlockHeaderId, height : number) : ArrayList<BlockHeader>{
        if(this.store != null && this.heightIndex != null){
            let childHeight = height + 1;

            let list = this.heightIndex.getHeadersAtHeight(childHeight);

            if(list == null){
                return new ArrayList<BlockHeader>();
            }

            let headers = new ArrayList<BlockHeader>();

            let maxLoop = list.size();
            for(let i = 0; i != maxLoop; ++i){
                let fpos = list.get(i);

                let header = this.store.loadHeader(fpos);

                let lastHeaderId = header.getLastHeaderId();

                if(lastHeaderId.equals(headerId)){
                    headers.addElement(header);
                }
            }

            return headers;
        }
        throw new NullPointerException("BlockHeaderStoreCacheElement.getChildrenOf()");
    }

    public removeBlock(hash : BlockHeaderId, height : number) {
        if(this.store != null && this.heightIndex != null){
            let list = this.heightIndex.getHeadersAtHeight(height);
            if(list == null){
                return;
            }

            let fpos2remove = -1;

            let maxLoop = list.size();
            for(let i = 0; i != maxLoop; ++i){
                let fpos = list.get(i);

                let header = this.store.loadHeader(fpos);
                let id = header.getId();

                if(id.equals(hash)){
                    fpos2remove = fpos;
                    break;
                }
            }

            this.heightIndex.removeIndex(height, fpos2remove);
            this.store.removeHeader(fpos2remove);
        }
    }

    public finalize(height : number, headerId : BlockHeaderId, notifier : IHeaderRemovalNotifier | null) : void {
        if(this.store != null && this.heightIndex != null) {
            let list = this.heightIndex.getHeadersAtHeight(height);

            if(list != null){ // guard
                let maxLoop = list.size();
                for(let i = 0; i != maxLoop; ++i){
                    let fpos = list.get(i);

                    let header = this.store.loadHeader(fpos);
                    let id = header.getId();
                    if(headerId.equals(id)){
                        continue;
                    }

                    // remove header
                    this.heightIndex.removeIndex(height, fpos);
                    this.store.removeHeader(fpos);

                    // call body deleter
                    if(notifier != null){
                        notifier.onRemovedHeader(header);
                    }
                }
            }
        }
    }


}