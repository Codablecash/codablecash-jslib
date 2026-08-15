import { LongRange } from "../filestore/LongRange";
import { LongRangeList } from "../filestore/LongRangeList";
import { RandomAccessFile } from "../random_access_file/RandomAccessFile";
import { VariableBlock } from "./VariableBlock";


export class VariableBlockHeader {
	private file : RandomAccessFile;
	private availableArea : LongRangeList | null;
	private blockUnitSize : number;
	private numBlocks : number;
	private extendBlocks : number;

    constructor(file : RandomAccessFile) {
        this.file = file;
        this.availableArea = null;
        this.blockUnitSize = 0;
        this.numBlocks = 0;
        this.extendBlocks = 0;
    }

    public getBlockUnitSize() : number {
        return this.blockUnitSize;
    }


    public allocateAll(range : LongRange) {
        let blockBytes = range.width() * this.blockUnitSize;
        let used = blockBytes - VariableBlock.HEADER_SIZE;

        let fpos = range.getMin() * this.blockUnitSize;
        let block = new VariableBlock(blockBytes, fpos, used, /*nextfpos*/0, null);

        if(this.availableArea){ // guard
            this.availableArea.removeRange(range);
        }
        
        return block;
    }

    public availableWithRange(range : LongRange) {
        let numBlocks = range.width();

        return (numBlocks * this.blockUnitSize) - VariableBlock.HEADER_SIZE;
    }

    public isEmpty() : boolean {
	    return this.availableArea != null && this.availableArea.isEmpty();
    }

    public freeFragment(range : LongRange) {
        if(this.availableArea != null){
             this.availableArea.addRange(range);
        }
    }

    public availableCapacity() {
        let ret = 0;

        if(this.availableArea != null){ // guard
            let maxLoop = this.availableArea.size();
            for(let i = 0; i != maxLoop; ++i){
                
                let range = this.availableArea.get(i);

                if(range != null){
                    let width = range.width();

                    ret += (width * this.blockUnitSize) - VariableBlock.HEADER_SIZE;
                }
            }
        }

        return ret;
    }
}
