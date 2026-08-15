import { ByteBuffer } from "../base_io/ByteBuffer";
import { LongRange } from "../filestore/LongRange";
import { LongRangeList } from "../filestore/LongRangeList";
import { FileIOException } from "../osenv/FileIOException";
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


    public async sync(fileSync : boolean) {
        await this.sync2File();
        await this.file.sync(fileSync);
    }
        
    public async sync2File() {
        let headSize = 8 * 4;
        let contentSize = this.availableArea != null ? this.availableArea.binarySize() : 0;
        let binSize = headSize + contentSize;

        let buff = ByteBuffer.allocateWithEndian(binSize, true);
        
        buff.putLong(binSize);
        buff.putLong(this.blockUnitSize);
        buff.putLong(this.extendBlocks);
        buff.putLong(this.numBlocks);

        this.availableArea && this.availableArea.toBinary(buff);
	    buff.position(0);

        // sync with file
        this.file.setLength(binSize + headSize);

        // file size
        let buffSizeHeader = ByteBuffer.allocateWithEndian(headSize, true);
        buffSizeHeader.putLong(binSize);
        buffSizeHeader.putLong(this.blockUnitSize);
        buffSizeHeader.putLong(this.extendBlocks);
        buffSizeHeader.putLong(this.numBlocks);
        buffSizeHeader.position(0);

        let fpos = 0;
        let binary = buffSizeHeader.toUint8Array();
        fpos += await this.file.write(fpos, binary, headSize);

        // content
        binary = buff.toUint8Array().slice(headSize);
        await this.file.write(fpos, binary, contentSize);

        //binary = ((const char*)buff.array()) + headSize;
        //int cnt = this.file.write(fpos, binary, contentSize);

    }

    public async loadFromFile() {
        let fpos = 0;
        let headSize = 8 * 4;
        let sizeHeaderBinary = new Uint8Array(headSize);

        fpos += await this.file.read(fpos, sizeHeaderBinary, headSize);

        let buffSizeHeader = ByteBuffer.allocateWithEndian(headSize, true);

        buffSizeHeader.putUint8Array(sizeHeaderBinary, headSize);

        buffSizeHeader.position(0);
        let loadSize = buffSizeHeader.getLong();
        this.blockUnitSize = Number(buffSizeHeader.getLong());
        this.extendBlocks = Number(buffSizeHeader.getLong());
        this.numBlocks = Number(buffSizeHeader.getLong());

        let areaSize = Number(loadSize) - headSize;
        if(areaSize < 4){
            throw new FileIOException("File header format is broken");
        }

        let usedAreaBinary = new Uint8Array(areaSize);
        fpos += await this.file.read(fpos, usedAreaBinary, areaSize);


        let rangeBinary = ByteBuffer.allocateWithEndian(areaSize, true);
        
        rangeBinary.putUint8Array(usedAreaBinary, areaSize);
        rangeBinary.position(0);
        this.availableArea = LongRangeList.fromBinary(rangeBinary);
    }

    public reallocFirstMaxFragment(firstBlockPos : number, size : number) : VariableBlock {
        let range = null;

        if(this.availableArea != null){ //guard
            let maxLoop = this.availableArea.size();
            for(let i = 0; i != maxLoop; ++i){
                let r = this.availableArea.get(i);

                if(r != null){
                    let min = r.getMin();
                    let max = r.getMax();

                    if(min <= firstBlockPos && firstBlockPos <= max){
                        range = new LongRange(r.getMin(), r.getMax());
                        range.setMin(firstBlockPos);
                        break;
                    }
                }
            }

            if(range != null){ // guard
                return this.allocMaxFragment(range, size);
            }
        }

        throw new FileIOException("range error@reallocFirstMaxFragment");
    }

    public allocMaxFragment(value : LongRange | number, size? : number) : VariableBlock {
        if(typeof value == "number" && this.availableArea != null){
            let range = this.availableArea.get(0);
            
            if(range != null && size != undefined){
                return this.__allocMaxFragment(range, size);
            }
        }

        if(size != undefined){
            return this.__allocMaxFragment((value as unknown) as LongRange, size);
        }
        
        throw new FileIOException("range error@allocMaxFragment");
    }

    private __allocMaxFragment(range : LongRange, size : number) : VariableBlock {
        let maxAvailable = this.availableWithRange(range);
        if(size > maxAvailable){
            return this.allocateAll(range);
        }

        let numBlock = this.getNumAllocationBlocks(size);

        let fpos = range.getMin() * this.blockUnitSize;
        let block = new VariableBlock(this.blockUnitSize * numBlock, fpos, /*used*/ size, /*nextfpos*/0, null);

        let min = range.getMin();
        let allocatedRange = new LongRange(min, min + numBlock - 1);

        (this.availableArea != null) && this.availableArea.removeRange(allocatedRange);
        
        return block;
    }

    public getNumAllocationBlocks(size : number) {
        let remain = size - (this.blockUnitSize - VariableBlock.HEADER_SIZE);
        if(remain <= 0){
            return 1;
        }

        // secondary
        let num = remain / this.blockUnitSize;
        let mod = remain % this.blockUnitSize;

        return (mod == 0) ? num + 1 : num + 2; // add first block
    }

    public allocateAll(range : LongRange) : VariableBlock {
        let blockBytes = range.width() * this.blockUnitSize;
        let used = blockBytes - VariableBlock.HEADER_SIZE;

        let fpos = range.getMin() * this.blockUnitSize;
        let block = new VariableBlock(blockBytes, fpos, used, /*nextfpos*/0, null);

        if(this.availableArea){ // guard
            this.availableArea.removeRange(range);
        }
        
        return block;
    }

    public availableWithRange(range : LongRange) : number {
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
