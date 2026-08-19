import { ByteBuffer } from "../base_io/ByteBuffer";

export interface IBlockObject {
	binarySize() : number;
	toBinary(out : ByteBuffer) : void;

    copyData() : IBlockObject;
}
