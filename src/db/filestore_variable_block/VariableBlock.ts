import { ByteBuffer } from "../base_io/ByteBuffer";
import { LongRange } from "../filestore/LongRange";
import { FileIOException } from "../osenv/FileIOException";
import { VariableBlockFileBody } from "./VariableBlockFileBody";
import { VariableBlockHeader } from "./VariableBlockHeader";

export class VariableBlock {
    public static HEADER_SIZE = 2 + 8;

    private blockSize : number;
    private currentfPos : number;

    // header
    private nextfpos : number;
    private used : number;

    // body
    private data : Uint8Array;

    constructor(blockSize : number, fpos : number, used : number, nextfpos : number, data : Uint8Array | null) {
        this.blockSize = blockSize;
        this.currentfPos = fpos;
        this.used = used;
        this.nextfpos = nextfpos;

        this.data = new Uint8Array(this.dataSize());
        if(data != null){
            let sd = data.slice(0, used);
            this.data.set(sd, 0);
        }
    }

    public async writeBack(body : VariableBlockFileBody) : Promise<void> {
        let rfile = body.getFile();

        let fpos = this.currentfPos;
        let buff = ByteBuffer.allocateWithEndian(VariableBlock.HEADER_SIZE, true); 
		buff.putShort(this.used);
		buff.putLong(this.nextfpos);

        buff.position(0);
        let d = buff.toUint8Array();
        fpos += await rfile.write(fpos, d, buff.limit());

        if((fpos - this.currentfPos) == this.blockSize){
            throw new FileIOException("assert error at VariableBlock.writeBack().");
        }
    }

    public write(buff : Uint8Array, length : number) : void {
        let b = buff.slice(0, length);
        this.data.set(b, 0);

        this.used = length;
    }

    public static async load(body : VariableBlockFileBody, fpos : number, blockunit : number) {
        let rfile = body.getFile();

        let __fpos = fpos;

        let tmp = new Uint8Array(VariableBlock.HEADER_SIZE);
        __fpos += await rfile.read(__fpos, tmp, VariableBlock.HEADER_SIZE);

        let buff = ByteBuffer.wrapWithEndian(tmp, VariableBlock.HEADER_SIZE, true);
        let used = buff.getShort();
        let nextfpos = buff.getLong();
        let blockSize = VariableBlock.toBlockSize(used, blockunit);       

        let data = new Uint8Array(used);

        __fpos += await rfile.read(__fpos, data, used);

        let block = new VariableBlock(blockSize, fpos, used, Number(nextfpos), data);
        return block;
    }

    public static toBlockSize(used : number ,blockunit : number) : number {
        let total = used + VariableBlock.HEADER_SIZE;
        let mod = total % blockunit;
        let ret = total - mod;
        if(mod != 0){
            ret += blockunit;
        }

        return ret;
    }

    public freeBlock(header : VariableBlockHeader, body : VariableBlockFileBody){
        let blockUnitSize = header.getBlockUnitSize();

        let range = this.getLongRange(blockUnitSize);
        header.freeFragment(range);

        body.resetHeader(this.currentfPos);
    }

    public getLongRange(blockUnitSize : number) : LongRange {
        let min = this.currentfPos / blockUnitSize;
        let numBlocks = this.blockSize / blockUnitSize;

        let max = min + numBlocks - 1;

        return new LongRange(min, max);
    }

    public headerSize() : number {
        return VariableBlock.HEADER_SIZE;
    }

    public dataSize() : number {
        return this.blockSize - this.headerSize();
    }

    public getUsedSize() : number {
        return this.used;
    }

    public getfPos() : number {
        return this.currentfPos;
    }

    public setNextPos(fpos : number) : void {
        this.nextfpos = fpos;
    }

    public getNextPos() : number {
        return this.nextfpos;
    }

    public getData() : Uint8Array {
        return this.data;
    }
}
