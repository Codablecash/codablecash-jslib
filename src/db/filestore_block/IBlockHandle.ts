import { ByteBuffer } from "../base_io/ByteBuffer";


export interface IBlockHandle {
    getFpos() : number;
    getBuffer() : ByteBuffer | null;
    size() : number;

    write(bytes : Uint8Array, length : number) : void;
}