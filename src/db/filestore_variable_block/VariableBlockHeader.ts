import { LongRange } from "../filestore/LongRange";
import { LongRangeList } from "../filestore/LongRangeList";
import { RandomAccessFile } from "../random_access_file/RandomAccessFile";


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

    public freeFragment(range : LongRange) {
        // this.availableArea.addRange(range);
    }
}
