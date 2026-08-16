import { ArrayList } from "../base/ArrayList";
import { ByteBuffer } from "../base_io/ByteBuffer";
import { BlockFileStorageException } from "../filestore_block/BlockFileStorageException";
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

    public write(bytes : Uint8Array, length : number) : void {
        let body = this.store.getBody();

        let list = this.store.getBlockList(this.fpos);
	
        // need realloc
        if(this.needRealloc(list, length) && list != undefined){
            this.removeBlocks(list);
            
            list = this.realloc(length);
        }

        // replace buffer
        let cap = this.buffer != null ? this.buffer.capacity() : 0;
        if(cap < length){
            let b = ByteBuffer.allocateWithEndian(length, true);
            this.setBuffer(b);
        }

        if(this.buffer != null){
            this.buffer.position(0);
            this.buffer.putUint8Array(bytes, length);
            this.buffer.position(0);
            
            let ptr = this.buffer.toUint8Array();
            let ptrpos = 0;

            let writeRemain = length;

            let maxLoop = list.size();
            for(let i = 0; i != maxLoop; ++i){
                let block = list.get(i);

                if(block != null && body != null){ // guard
                    let writeLength = (writeRemain > block.dataSize()) ? block.dataSize() : writeRemain;

                    var sl = ptr.slice(ptrpos, writeLength);

                    block.write(sl, writeLength);
                    ptrpos += writeLength;
                    writeRemain -= writeLength;

                    block.writeBack(body);
                }

            }
        }
    }

    public realloc(length : number) : ArrayList<VariableBlock> {
        let handle = this.store.realloc(this.fpos, length);

        let other = <VariableBlockHandle>handle;
        let b = other.moveBuffer();

        if(b != null){ // guard
             this.setBuffer(b);
        }
       
        // update handle
        this.fpos = handle.getFpos();

        return this.store.getBlockList(this.fpos);
    }

    public needRealloc(list : ArrayList<VariableBlock>, length : number) : boolean {
        if(this.store != null){
            let header = this.store.getHeader();
            let blockUnitSize = header != null ? header.getBlockUnitSize() : 0;

            let availbleSize = this.getAvailableSize(list);
            let leftUnused = availbleSize > length ? availbleSize - length : 0;
            return (length > availbleSize) || (leftUnused >= blockUnitSize);
        }

        throw new BlockFileStorageException("Failed in VariableBlockHandle.needRealloc");
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

    public removeBlocks(list? : ArrayList<VariableBlock>) : void {
        if(list != undefined){
            this.__removeBlocks(list);
            return;
        }

        let mylist = this.store.getBlockList(this.fpos);

        this.removeBlocks(mylist);
    }

    private __removeBlocks(list : ArrayList<VariableBlock>) : void {
        let header = this.store.getHeader();
        let body = this.store.getBody();

        let maxLoop = list.size();
        for(let i = 0; i != maxLoop; ++i){
            let block = list.get(i);

            if(block != null && header != null && body != null){ // guard
                block.freeBlock(header, body);
            }
        }

        this.store.sync(false);
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