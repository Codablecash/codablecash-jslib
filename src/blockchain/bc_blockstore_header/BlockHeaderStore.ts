import { NullPointerException } from "../../db/base/NullPointerException";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { CFile } from "../../db/base_io/CFile";
import { VariableBlockFileStore } from "../../db/filestore_variable_block/VariableBlockFileStore";
import { DiskCacheManager } from "../../db/random_access_file/DiskCacheManager";
import { BlockHeader } from "../bc_block/BlockHeader";

export class BlockHeaderStore {
    public static FILE_NAME = "headerstore";

	private index : number;
	private baseDir : CFile;
	private cacheManager : DiskCacheManager;
	private store : VariableBlockFileStore | null;

    constructor(index : number, baseDir : CFile, cacheManager : DiskCacheManager) {
        this.index = index;
        this.baseDir = baseDir;
        this.cacheManager = cacheManager;
        this.store = null;       
    }

    public exists() : boolean {
        let f = this.getStoreFile();
        let hf = this.getStoreHeaderFile();

        let fb = f.exists();
        let hfb = hf.exists();

        return fb && hfb;
    }

    public create() : void {
        let fileName = BlockHeaderStore.FILE_NAME;
        fileName = this.addIdex2String(fileName);

        let dir = this.baseDir.getAbsolutePath();
  
        let tmpStore = new VariableBlockFileStore(dir, fileName, this.cacheManager);
        tmpStore.createStore(true, 1024, 64);

        tmpStore.open(false);
        let handle = tmpStore.alloc(10);
        
        tmpStore.close();
    }

    public open() : void {
        let fileName = BlockHeaderStore.FILE_NAME;
        fileName = this.addIdex2String(fileName);

        let dir = this.baseDir.getAbsolutePath();

        this.store = new VariableBlockFileStore(dir, fileName, this.cacheManager);

        this.store.open(false);
    }

    public close() : void {
        if(this.store != null){
            this.store.close();
            this.store = null;
        }
    }

    public storeHeader(header : BlockHeader) : number {
        if(this.store != null){
            let size = header.binarySize();// TODO  check

            let buff = ByteBuffer.allocateWithEndian(size, true);
            header.toBinary(buff);

            buff.position(0);
            // assert(buff.capacity() == size);

            let handle = this.store.alloc(size);
            handle.write(buff.toUint8Array(), size);

            let fpos = handle.getFpos();
            return fpos;
        }
        throw new NullPointerException("BlockHeaderStore.storeHeader()");
    }

    public loadHeader(fpos : number) : BlockHeader {
        if(this.store != null){
            let handle = this.store.get(fpos);

            let buff = handle.getBuffer();

            let block = BlockHeader.createFromBinary(buff);

            return block;
        }
        throw new NullPointerException("BlockHeaderStore.loadHeader()");
    }

    public removeHeader(fpos : number) : void {
        if(this.store != null){
            let handle = this.store.get(fpos);
            handle.removeBlocks();
            return;
        }
        throw new NullPointerException("BlockHeaderStore.removeHeader()");
    }

    public getStoreFile() : CFile {
        let binFileName = BlockHeaderStore.FILE_NAME;
        binFileName = this.addIdex2String(binFileName);

        binFileName = binFileName + ".bin";

        let f = this.baseDir.get(binFileName);
        return f;
    }

    public getStoreHeaderFile() : CFile {
        let binFileName = BlockHeaderStore.FILE_NAME;
        binFileName = this.addIdex2String(binFileName);

        binFileName = binFileName + "-header.bin";

        let f = this.baseDir.get(binFileName);

        return f;
    }

    public addIdex2String(str : string) : string {
        let num : string = this.index.toString(10).padStart(8, "0");

        return str + num;
    }
}