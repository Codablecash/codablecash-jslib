import { ArrayList } from "../base/ArrayList";
import { Exception } from "../base/Exception";
import { ByteBuffer } from "../base_io/ByteBuffer";
import { FileStore } from "../filestore/FileStore";
import { BlockFileStorageException } from "../filestore_block/BlockFileStorageException";
import { IBlockFileStore } from "../filestore_block/IBlockFileStore";
import { IBlockHandle } from "../filestore_block/IBlockHandle";
import { DiskCacheManager } from "../random_access_file/DiskCacheManager";
import { VariableBlock } from "./VariableBlock";
import { VariableBlockFileBody } from "./VariableBlockFileBody";
import { VariableBlockHandle } from "./VariableBlockHandle";
import { VariableBlockHeader } from "./VariableBlockHeader";


export class VariableBlockFileStore extends FileStore implements IBlockFileStore {
    private body : VariableBlockFileBody | null;
	private header : VariableBlockHeader | null;

    constructor(dir : string, name : string, cacheManager : DiskCacheManager){
        super(dir, name, cacheManager);

        this.header = null;
        this.body = null;
    }

    public getHeader() {
        return this.header;
    }

    public getBody() {
        return this.body;
    }

    public async createStore(del : boolean, defaultSize : number, blockUnitSize : number, extendBlocks : number = 1024) {
        let mod = defaultSize % blockUnitSize;

        await this.__createStore(del, defaultSize);
	    await this.__open(false);

        if(this.headerFile != null){ // guard
            this.header = new VariableBlockHeader(this.headerFile);
        }
       
        try{
            if(this.header != null && this.file != null){ // guard
                this.header.createStore(del, defaultSize, blockUnitSize, extendBlocks);

                this.body = new VariableBlockFileBody(this.file, this.header.getBlockUnitSize());
                this.body.createStore(del, blockUnitSize);
            }
        }
        catch(error){
            this.internalClear();

            throw new BlockFileStorageException("Failed in creating block file store");
        }
    }

    public async open(sync : boolean) {
        await this.__open(sync);

        if(this.headerFile != null){ // guard
            this.header = new VariableBlockHeader(this.headerFile);
        }

        try{

        }catch(error){
            this.internalClear();
            await super.close();

            throw new BlockFileStorageException("Failed in opening block file store");
        }
    }
    
    public internalClear() {
        if(this.header != null){
            this.header = null;
        }
        if(this.body != null){
            this.body = null;
        }
    }

    public async close() : Promise<void> {
        await super.close();
	    this.internalClear();
    }

    public async extendFile() {
        if(this.header != null && this.body != null){
            let numExtendedBlocks = this.header.extend();

            let newLength = numExtendedBlocks * this.header.getBlockUnitSize();
            await this.body.extend(newLength);

            await this.sync(false);
        }
    }

    public async sync(fsync : boolean) {
        if(this.header != null && this.body != null){
            await this.header.sync(fsync);
            await this.body.sync(fsync);
        }
    }

    public async realloc(fpos : number, size : number) {
        if((this.header != null && this.header.isEmpty()) || (this.header != null && this.header.availableCapacity() < size) ){
            // extend file size
            await this.extendFile();
        }

        let sizeRemain = size;

	    let list = new ArrayList<VariableBlock>();

        if(this.header != null){ // guard
            // first block
            let blockUnitSize = this.header.getBlockUnitSize();
            let blockPos = fpos / blockUnitSize;
    
            let firstBlock = this.header.reallocFirstMaxFragment(blockPos, sizeRemain);
            sizeRemain -= firstBlock.getUsedSize();
            list.addElement(firstBlock);

            // second
            let lastBlock = firstBlock;
            while(sizeRemain > 0){
                let block = this.header.allocMaxFragment(sizeRemain);
                sizeRemain -= block.getUsedSize();

                lastBlock.setNextfpos(block.getfPos());

                list.addElement(block);
                lastBlock = block;
            }

            let maxLoop = list.size();
            for(let i = 0; i != maxLoop; ++i){
                let block = list.get(i);

                if(block != null && this.body != null){ // guard
                     await block.writeBack(this.body);
                }
            }

            await this.sync(false);

            return this.blocksToHandle(list);
        }

        throw new BlockFileStorageException("Failed in realloc()");
    }

    public async alloc(size : number) {
        if((this.header != null && this.header.isEmpty()) || (this.header != null && this.header.availableCapacity() < size) ){
            // extend file size
            await this.extendFile();
        }
        
        let sizeRemain = size;

	    let list = new ArrayList<VariableBlock>();

        let lastBlock : VariableBlock|null = null;

        do{
            if(this.header != null) { // guard
                let block = this.header.allocMaxFragment(sizeRemain);
                sizeRemain -= block.getUsedSize();

                if(lastBlock != null){
                    lastBlock.setNextfpos(block.getfPos());
                }

                list.addElement(block);
                lastBlock = block;
            }
        }
        while(sizeRemain > 0);

        let maxLoop = list.size();
        for(let i = 0; i != maxLoop; ++i){
            let block = list.get(i);
            
            if(this.body != null && block != null){
                await block.writeBack(this.body);
            }
        }

        this.sync(false);

        return this.blocksToHandle(list);
    }

    public blocksToHandle(list : ArrayList<VariableBlock>) : IBlockHandle {
        let handle = new VariableBlockHandle(this);
        {
            // let fpos = list.get(0).getfPos();
            var blk = list.get(0);
            let fpos = blk != null ? blk.getfPos() : 0;

            handle.setFpos(fpos);
        }

        // datasize
        let dataSize = 0;
        let maxLoop = list.size();
        for(let i = 0; i != maxLoop; ++i){
            let block = list.get(i);

            if(block != null){ // guard
                dataSize += block.getUsedSize();
            }
        }

        // copy
        let buff = ByteBuffer.allocateWithEndian(dataSize, true);
        handle.setBuffer(buff);

        for(let i = 0; i != maxLoop; ++i){
            let block = list.get(i);

            if(block != null){ // guard
                let length = block.getUsedSize();
                let data : Uint8Array = block.getData();

                buff.putUint8Array(data, length);
            }
        }

        buff.position(0);

        return handle;
    }

    public async get(fpos : number) {
        let list = await this.getBlockList(fpos);

        var handle = this.blocksToHandle(list);

        return handle;
    }
    
    public async getBlockList(fpos : number) {
        if(this.body != null && this.header != null){
            let blockUnitSize = this.header.getBlockUnitSize();

            let list = new ArrayList<VariableBlock>();

            let __fpos = fpos;

            let block : VariableBlock | null = null;
            do{
                block = await VariableBlock.load(this.body, __fpos, blockUnitSize);
                list.addElement(block);

                __fpos = block.getNextPos();
            }while(__fpos != 0);

            return list;     
        }
        
        throw new BlockFileStorageException("Failed in getBlockList()");
    }


}