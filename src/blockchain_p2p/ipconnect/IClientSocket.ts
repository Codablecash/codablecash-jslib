import { ByteBuffer } from "../../db/base_io/ByteBuffer";


export interface IClientSocket {
    connect(host : string, port : number) : Promise<void>;
    read()  : Promise<ByteBuffer>;
    write(data : Uint8Array) : void;
    close() : void;
}
