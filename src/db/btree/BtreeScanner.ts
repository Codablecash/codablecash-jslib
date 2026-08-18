import { NullPointerException } from "../base/NullPointerException";
import { IBlockObject } from "../filestore_block/IBlockObject";
import { AbstractBtreeKey } from "./AbstractBtreeKey";
import { NodeCursor } from "./NodeCursor";

export class BtreeScanner {
	private cursor : NodeCursor;
	private nextObj : IBlockObject | null;
	private initialized : boolean;
	private key : AbstractBtreeKey | null;

    constructor(cursor : NodeCursor) {
        this.cursor = cursor;
        this.nextObj = null;
        this.initialized = false;
        this.key = null;
    }

    public begin() : void {
    }

    public hasNext() : boolean {
        if(this.nextObj != null){
            this.nextObj = null;
        }

        if(!this.initialized){
            if(this.key == null){
                this.nextObj = this.cursor.gotoFirst();
                this.initialized = true;
            }
            else{
                this.nextObj = this.cursor.gotoKey(this.key);
                this.initialized = true;
            }
        }
        else{
            this.nextObj = this.cursor.getNext();
        }

        return this.nextObj != null;
    }

    public next() : IBlockObject {
        if(this.nextObj != null){
            return this.nextObj;
        }
        throw new NullPointerException("BtreeScanner.next()");
    }

    public nextKey() : AbstractBtreeKey {
        return this.cursor.getCurrentKey();
    }
}
