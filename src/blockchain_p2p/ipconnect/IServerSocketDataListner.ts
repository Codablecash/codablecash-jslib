import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { IpClientConnection } from "./IpClientConnection";


export interface ISeverSocketDataListner {
    onData(con : IpClientConnection, data: ByteBuffer) : void;
}
