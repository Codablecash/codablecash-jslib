import { ArrayList } from "../base/ArrayList";
import { ByteBuffer } from "../base_io/ByteBuffer";
import { VariableBlock } from "../filestore_variable_block/VariableBlock";


export interface IBlockHandle {
    getFpos() : number;
    getBuffer() : ByteBuffer | null;
    size() : number;

    write(bytes : Uint8Array, length : number) : void;
    removeBlocks(list? : ArrayList<VariableBlock>) : void;
}