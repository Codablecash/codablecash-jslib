import { ByteBuffer } from "../base_io/ByteBuffer";
import { FileIOException } from "../osenv/FileIOException";
import { VariableBlockFileBody } from "./VariableBlockFileBody";

export class VariableBlock {
    public static HEADER_SIZE = 2 + 8;

    private blockSize : number;
    private currentfPos : number;

    // header
    private nextfpos : number;
    private used : number;

    // body
    private data : Uint8Array;

    constructor(blockSize : number, fpos : number, used : number, nextfpos : number, data : Uint8Array) {
        this.blockSize = blockSize;
        this.currentfPos = fpos;
        this.used = used;
        this.nextfpos = nextfpos;

        this.data = new Uint8Array(this.dataSize());
        if(this.data != null){
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

    public setNextfpos(fpos : number) : void {
        this.nextfpos = fpos;
    }

    public getNExtPos() : number {
        return this.nextfpos;
    }

    public getData() : Uint8Array {
        return this.data;
    }
}
