import { NullPointerException } from "../../db/base/NullPointerException";
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

    public getHeaderStoreCacheElement(height : number, create : boolean) : BlockHeaderStoreCacheElement {
        let index = height / this.sectionLimit;

        let cache = this.findCache(index);
        if(cache != null){
            return cache;
        }

        if(this.list.size() == this.maxCache){
            let lastElement =  this.list.getLastElement();

            if(lastElement != null){
                let lastCache = lastElement.data;
                if(lastCache != null){
                    lastCache.close();
                    this.list.removeElement(lastElement);
                }
            }

        }

        cache = new BlockHeaderStoreCacheElement(this.baseDir, index);
        if(!cache.exist() && !create){
            throw new NullPointerException("BlockHeaderStoreCache.getHeaderStoreCacheElement()");
        }

        if(!cache.exist()){
            cache.create();
        }

        cache.open(); // open
        this.list.__add(0, cache);

        return cache;
    }

    public findCache(index : number) : BlockHeaderStoreCacheElement | null {
        let ret = null;

        let maxLoop = this.list.size();
        for(let i = 0; i != maxLoop; ++i){
            let cache = this.list.get(i);

            if(cache != null && index == cache.getIndex()){
                this.list.moveElementToTop(i);
                ret = cache;
                break;
            }
        }

        return ret;
    }
}