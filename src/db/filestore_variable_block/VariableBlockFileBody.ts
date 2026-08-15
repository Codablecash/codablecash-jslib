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

    public async sync(fileSync : boolean) : Promise<void> {
        await this.file.sync(fileSync);
    }

    public async resetHeader(fpos: number) : Promise<void> {
        let tmp = new Uint8Array(VariableBlock.HEADER_SIZE);
        tmp.fill(0);

        await this.file.write(fpos, tmp, VariableBlock.HEADER_SIZE);
    }

    public async extend(newLength : number) : Promise<void> {
        await this.file.setLength(newLength);
    }

    public getFile() : RandomAccessFile {
        return this.file;
    }
}
