import { IBlockHandle } from "./IBlockHandle";


export interface IBlockFileStore {
    createStore(del : boolean, defaultSize : number, blockUnitSize : number, extendBlocks : number) : void;
    open(sync : boolean) : void;
    close() : void;

    alloc(size : number) : IBlockHandle;
    get(fpos : number) : IBlockHandle;
    sync(fsync : boolean) : void;
}