import { Exception } from "../base/Exception";
import { FileStore } from "../filestore/FileStore";
import { BlockFileStorageException } from "../filestore_block/BlockFileStorageException";
import { IBlockFileStore } from "../filestore_block/IBlockFileStore";
import { DiskCacheManager } from "../random_access_file/DiskCacheManager";
import { VariableBlockFileBody } from "./VariableBlockFileBody";
import { VariableBlockHeader } from "./VariableBlockHeader";


export class VariableBlockFileStore extends FileStore implements IBlockFileStore {
    private body : VariableBlockFileBody | null;
	private header : VariableBlockHeader | null;

    constructor(dir : string, name : string, cacheManager : DiskCacheManager){
        super(dir, name, cacheManager);

        this.header = null;
        this.body = null;
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
}