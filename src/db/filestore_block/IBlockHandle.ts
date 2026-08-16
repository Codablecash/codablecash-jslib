

export interface IBlockHandle {
    getFpos() : number;

    write(bytes : Uint8Array, length : number) : void;
}