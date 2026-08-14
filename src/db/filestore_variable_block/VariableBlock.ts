
export class VariableBlock {
    public static HEADER_SIZE = 2 + 8;

    private blockSize : number;
    private currentPos : number;

    // header
    private nextfpos : number;
    private used : number;

    // body
    private data : Uint8Array;

    constructor(blockSize : number, fpos : number, used : number, nextfpos : number, data : Uint8Array) {
        this.blockSize = blockSize;
        this.currentPos = fpos;
        this.used = used;
        this.nextfpos = nextfpos;

        this.data = new Uint8Array(this.dataSize());
        if(this.data != null){
            let sd = data.slice(0, used);
            this.data.set(sd, 0);
        }
    }

    public headerSize() : number {
        return VariableBlock.HEADER_SIZE;
    }

    public dataSize() : number {
        return this.blockSize - this.headerSize();
    }
}
