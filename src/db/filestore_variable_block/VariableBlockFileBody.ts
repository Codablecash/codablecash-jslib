import { RandomAccessFile } from "../random_access_file/RandomAccessFile";
import { VariableBlock } from "./VariableBlock";

export class VariableBlockFileBody {
    private file : RandomAccessFile;
    private blockUnitSize: number;

    constructor(file : RandomAccessFile, blockSize : number){
        this.file = file;
        this.blockUnitSize = blockSize;
    }

    public createStore(del : boolean, blockUnitSize : number) : void {
        this.blockUnitSize = blockUnitSize;
    }

    public sync(fileSync : boolean) : void {
        this.file.sync(fileSync);
    }

    public resetHeader(fpos: number) : void {
        let tmp = new Uint8Array(VariableBlock.HEADER_SIZE);
        tmp.fill(0);

        this.file.write(fpos, tmp, VariableBlock.HEADER_SIZE);
    }

    public extend(newLength : number) : void {
        this.file.setLength(newLength);
    }

    public getFile() : RandomAccessFile {
        return this.file;
    }
}
