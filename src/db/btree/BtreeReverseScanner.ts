import { IBlockObject } from "../filestore_block/IBlockObject";
import { AbstractBtreeKey } from "./AbstractBtreeKey";
import { NodeCursor } from "./NodeCursor";

export class BtreeReverseScanner {
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

    public begin(key? : AbstractBtreeKey) {
        if(key != undefined){
            this.key = key != null ? key.clone() : null;
        }
    } 

    public hasPrevious() : boolean {
        if(this.nextObj != null){
            this.nextObj = null;
        }

        if(!this.initialized){
            if(this.key == null){
                this.nextObj = this.cursor.gotoLast();
                this.initialized = true;
            }
            else{
                this.nextObj = this.cursor.gotoKeyPrevious(this.key);
                this.initialized = true;
            }
        }
        else{
            this.nextObj = this.cursor.getPrevious();
        }

        return this.nextObj != null;
    }

    
}