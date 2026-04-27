import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { IpClientConnection } from "./IpClientConnection";
import { ISeverSocketDataListner } from "./IServerSocketDataListner";

export class EchoServerDataListner implements ISeverSocketDataListner {
    public onData(con : IpClientConnection, data: ByteBuffer) : void {
        let str = data.toString();

        str = "Echo " + str;
        const uint8Array = new TextEncoder().encode(str);
        con.write(uint8Array);
    }

}
