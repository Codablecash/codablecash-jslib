import { BlockHeaderId } from "../bc_block/BlockHeaderId";
import { HeadBlockDetectorCacheElement } from "./HeadBlockDetectorCacheElement";

export class HeadBlockDetectorCache {
    private map : Map<string, HeadBlockDetectorCacheElement>;

    constructor(){
        this.map = new Map<string, HeadBlockDetectorCacheElement>();
    }

    public registerCache(headerId : BlockHeaderId, cache : HeadBlockDetectorCacheElement) : void {
        this.map.set(headerId.toString(), cache);
    }

    public getCache(headerId : BlockHeaderId) : HeadBlockDetectorCacheElement | null {
        let ele =  this.map.get(headerId.toString());

        return ele != undefined ? ele : null;
    }

    public reset() : void {
        this.map.clear();
    }
}