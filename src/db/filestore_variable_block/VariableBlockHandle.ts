import { ArrayList } from "../base/ArrayList";
import { ByteBuffer } from "../base_io/ByteBuffer";
import { IBlockHandle } from "../filestore_block/IBlockHandle";
import { VariableBlock } from "./VariableBlock";
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

    public getAvailableSize(list : ArrayList<VariableBlock>) : number {
        let ret = 0;

        let maxLoop = list.size();
        for(let i = 0; i != maxLoop; ++i){
            let block = list.get(i);

            if(block != null){ // guard
                let available = block.dataSize();
                ret += available;
            }
        }

        return ret;
    }

    public getBuffer() : ByteBuffer | null{
        return this.buffer;
    }

    public async removeBlocks(list? : ArrayList<VariableBlock>) : Promise<void> {
        if(list != undefined){
            await this.__removeBlocks(list);
            return;
        }

        let mylist = await this.store.getBlockList(this.fpos);

        await this.removeBlocks(mylist);
    }

    private async __removeBlocks(list : ArrayList<VariableBlock>) : Promise<void> {
        let header = this.store.getHeader();
        let body = this.store.getBody();

        let maxLoop = list.size();
        for(let i = 0; i != maxLoop; ++i){
            let block = list.get(i);

            if(block != null && header != null && body != null){ // guard
                await block.freeBlock(header, body);
            }
        }

        await this.store.sync(false);
    }

    public size() : number {
        return this.buffer != null ? this.buffer.limit() : 0;
    }

    public setBuffer(buffer : ByteBuffer) {
        this.buffer = buffer;
    }

    public moveBuffer() : ByteBuffer | null {
        let ret = this.buffer;
        this.buffer = null;

        return ret;
    }
}