import { ByteBuffer } from "../base_io/ByteBuffer";
import { CFile } from "../base_io/CFile";
import { NodeCache } from "../btree_cache/NodeCache";
import { BtreeKeyFactory } from "../btreekey/BtreeKeyFactory";
import { InfinityKey } from "../btreekey/InfinityKey";
import { IBlockFileStore } from "../filestore_block/IBlockFileStore";
import { VariableBlockFileStore } from "../filestore_variable_block/VariableBlockFileStore";
import { DiskCacheManager } from "../random_access_file/DiskCacheManager";
import { AbstractBtreeDataFactory } from "./AbstractBtreeDataFactory";
import { BtreeConfig } from "./BtreeConfig";
import { BtreeHeaderBlock } from "./BtreeHeaderBlock";
import { TreeNode } from "./TreeNode";


export class BtreeStorage {
    private name : string;
    private folder : CFile;
    private factory : BtreeKeyFactory;
    private dfactory : AbstractBtreeDataFactory;

    private store : IBlockFileStore | null
    private cache : NodeCache | null;
    private rootFpos : number;
    
    constructor(folder : CFile, name : string, factory : BtreeKeyFactory, dfactory : AbstractBtreeDataFactory){
        this.name = name;
        this.folder = folder;
        this.factory = factory;
        this.dfactory = dfactory;

        this.store = null;
        this.cache = null;

        this.rootFpos = 0;
    }

    public close(){
        if(this.store != null){
            this.store.close();
        }
        if(this.cache != null){
            this.cache.clear();
        }
    }

    public exists() {
        let folderstr = this.folder.getAbsolutePath();

        let blockstore = new VariableBlockFileStore(folderstr, this.name, new DiskCacheManager());

        return blockstore.exists();
    }

    public create(cacheManager : DiskCacheManager, config : BtreeConfig) {
        let folderstr = this.folder.getAbsolutePath();
 
        let blockstore : IBlockFileStore = new VariableBlockFileStore(folderstr, this.name, cacheManager);

        blockstore.createStore(true, config.defaultSize, config.blockSize, 1024);

        blockstore.open(false);

        let rootFpos;
        {
            // pre alloc
            let handle = blockstore.alloc(1);
   
            handle = blockstore.alloc(1);

            rootFpos = handle.getFpos();
        }

        // root node
        {
            let handle = blockstore.get(rootFpos);

            let infinityKey = new InfinityKey();
            let rootNode = new TreeNode(true, config.nodeNumber, infinityKey, true);
            rootNode.setFpos(rootFpos);

            let cap = rootNode.binarySize();
            let buff = ByteBuffer.allocateWithEndian(cap, true);

            rootNode.toBinary(buff);

            let ar = buff.toUint8Array();
            handle.write(ar, cap);

            // assert(handle.getFpos() == rootFpos);
        }

        {
            // first header
            let header = this.makeHeader(config, rootFpos);

            let headerSize = header.binarySize();
            let buff = ByteBuffer.allocateWithEndian(headerSize, true);

            header.toBinary(buff);
            buff.position(0);

            let handle = blockstore.get(0);

            let ar = buff.toUint8Array();
            handle.write(ar, headerSize);

            // assert(handle.getFpos() == 0);
        }

        blockstore.sync(false);

        blockstore.close();
    }

    private makeHeader(config : BtreeConfig, rootFpos : number) {
        let header = new BtreeHeaderBlock();
        header.setConfig(config);
        header.setRootFpos(rootFpos);

        return header;
    }

}