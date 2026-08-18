import { NullPointerException } from "../base/NullPointerException";
import { ByteBuffer } from "../base_io/ByteBuffer";
import { CFile } from "../base_io/CFile";
import { NodeCache } from "../btree_cache/NodeCache";
import { BtreeKeyFactory } from "../btreekey/BtreeKeyFactory";
import { InfinityKey } from "../btreekey/InfinityKey";
import { IBlockFileStore } from "../filestore_block/IBlockFileStore";
import { IBlockObject } from "../filestore_block/IBlockObject";
import { VariableBlockFileStore } from "../filestore_variable_block/VariableBlockFileStore";
import { DiskCacheManager } from "../random_access_file/DiskCacheManager";
import { AbstractBtreeDataFactory } from "./AbstractBtreeDataFactory";
import { AbstractTreeNode } from "./AbstractTreeNode";
import { BtreeConfig } from "./BtreeConfig";
import { BtreeHeaderBlock } from "./BtreeHeaderBlock";
import { DataNode } from "./DataNode";
import { NodeHandle } from "./NodeHandle";
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

    public setRootFpos(rootFpos : number) {
        this.rootFpos = rootFpos;
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

    public open(numDataBuffer : number, numNodeBuffer : number, cacheManager : DiskCacheManager) {
        let folderstr = this.folder.getAbsolutePath();

        this.store = new VariableBlockFileStore(folderstr, this.name, cacheManager);
        this.store.open(false);

        this.cache = new NodeCache(numDataBuffer, numNodeBuffer);
    }

    public close(){
        if(this.store != null){
            this.store.close();
        }
        if(this.cache != null){
            this.cache.clear();
        }
    }

    public loadHeader() : BtreeHeaderBlock {
        if(this.store != null) {
            // load 0 fpos
            let handle = this.store.get(0);

            let buff = handle.getBuffer();
            if(buff != null){
                buff.position(0);

                let header = BtreeHeaderBlock.fromBinary(buff);
                return header;
            }
        }

        throw new NullPointerException("BtreeStorage.loadHeader()");
    }

    public sync(syncDisk : boolean) {
        this.store?.sync(syncDisk);
    }

    public loadRoot() : NodeHandle {
        return this.loadNode(this.rootFpos);
    }

    public loadNode(fpos : number) : NodeHandle {
        let ref = this.cache?.get(fpos);
        if(ref != null && ref != undefined){
            return new NodeHandle(ref);
        }

        if(this.store != null && this.cache != null){
            let handle = this.store.get(fpos);

            let buff = handle.getBuffer();
            buff.position(0);

            let node = BtreeStorage.makeNodeFromBinary(buff, this.factory);
            //__ASSERT_POS(buff);
            // assert(node.getFpos() == fpos);

            this.cache.add(node);
            ref = this.cache.get(fpos);

            if(ref != null){
                return new NodeHandle(ref);
            }
        }

        throw new NullPointerException("BtreeStorage.loadNode()");
    }

    public loadData(fpos : number) : IBlockObject {
        if(this.store != null){
            let handle = this.store.get(fpos);

            let buff = handle.getBuffer();
            buff.position(0);

            return this.dfactory.makeDataFromBinary(buff);
        }
        throw new NullPointerException("BtreeStorage.loadData()");
    }

    public static makeNodeFromBinary(buff : ByteBuffer, factory : BtreeKeyFactory) : AbstractTreeNode {
        var nodeType = buff.get();

        if(nodeType == AbstractTreeNode.NODE){
            return TreeNode.fromBinary(buff, factory);
        }

        // assert(nodeType == AbstractTreeNode.DATA);
        return DataNode.fromBinary(buff, factory);
    }

    public remove(fpos : number) {
        if(this.store != null && this.cache != null){
            // clear cache
            let ref = this.cache.get(fpos);
            if(ref != null){
                // delete cache object
                this.cache.remove(ref);
            }

            let handle = this.store.get(fpos);

            handle.removeBlocks();
        }
    }

    public storeData(data : IBlockObject, fpos? : number) : number {
        if(fpos != undefined){
            return this.__storeData(data, fpos);
        }

        if(this.store != null){
            let size = data.binarySize();
            let handle = this.store.alloc(size);

            let buff = ByteBuffer.allocateWithEndian(size, true);

            data.toBinary(buff);
            // __ASSERT_POS(buff);

            // const char* ptr = (const char*)buff.array();
            let ptr = buff.toUint8Array();
            handle.write(ptr, size);

            return handle.getFpos();
        }

        throw new NullPointerException("BtreeStorage.storeData()");
    }

    public __storeData(data : IBlockObject, fpos : number) : number {
        if(this.store != null){
            let handle = this.store.get(fpos);

            let size = data.binarySize();
            let buff = ByteBuffer.allocateWithEndian(size, true);

            data.toBinary(buff);
            // __ASSERT_POS(buff);

            // const char* ptr = (const char*)buff.array();
            let ptr = buff.toUint8Array();
            handle.write(ptr, size);

            return handle.getFpos();
        }
        throw new NullPointerException("BtreeStorage.__storeData()");
    }

    public updateNode(node : AbstractTreeNode) : void {
        if(this.store != null){
            let size = node.binarySize();

            let fpos = node.getFpos();
            let handle = this.store.get(fpos);

            let buff = ByteBuffer.allocateWithEndian(size, true);

            node.toBinary(buff);
            //_ASSERT_POS(buff);

            // const char* ptr = (const char*)buff.array();
            let ptr = buff.toUint8Array();
            handle.write(ptr, size);
        }
    }

    public removeData(dataFpos : number) : void {
        if(this.store != null){
            let handle = this.store.get(dataFpos);
            handle.removeBlocks();
        }
    }

    public storeNode(node : AbstractTreeNode) : number {
        if(this.store != null){
            let size = node.binarySize();
            let handle = this.store.alloc(size);

            let buff = ByteBuffer.allocateWithEndian(size, true);

            let fpos = handle.getFpos();
            node.setFpos(fpos);
            node.toBinary(buff);

            // const char* ptr = (const char*)buff.array();
            let ptr = buff.toUint8Array();
            handle.write(ptr, size);

            //assert(fpos == handle.getFpos());

            return handle.getFpos();
        }
        throw new NullPointerException("BtreeStorage.storeNode()");
    }
        
    public getDataFactory() : AbstractBtreeDataFactory {
        return this.dfactory;
    }
}