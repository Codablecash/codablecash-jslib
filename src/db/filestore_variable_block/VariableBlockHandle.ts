import { ByteBuffer } from "../base_io/ByteBuffer";
import { IBlockHandle } from "../filestore_block/IBlockHandle";
import { VariableBlockFileStore } from "./VariableBlockFileStore";


export class VariableBlockHandle implements IBlockHandle {
    private fpos : number;
    private store : VariableBlockFileStore;
    private buffer : ByteBuffer | null;

    constructor(store : VariableBlockFileStore){
        this.fpos = 0;
        this.store = store;
        this.buffer = null;
    }

    public getFpos() : number {
        return this.fpos;
    }
    public setFpos(fpos : number) : void {
		this.fpos = fpos;
	}

    public setBuffer(buffer : ByteBuffer) {
        this.buffer = buffer;
    }
}