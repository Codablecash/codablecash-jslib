import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { IpClientConnection } from "./IpClientConnection";
import { IServerSocket } from "./IServerSocket";
import { ISeverSocketDataListner } from "./IServerSocketDataListner";

import net = require('net');

export class IpV4ServerConnection implements IServerSocket {
    private server: net.Server;
    private host : string;
    private port : number;

    private dataListner? : ISeverSocketDataListner;

    constructor(listner? : ISeverSocketDataListner){
        this.dataListner = listner == null ? undefined : listner;
        
        this.server = net.createServer((socket: net.Socket) =>{
            socket.on('data', (data: Buffer) => {
                if(this.dataListner != null){
                    const clientSoclet = new IpClientConnection(socket);
                    const buff = new ByteBuffer(data.length);
                    buff.putBuffer(data);
                    buff.position(0);

                    this.dataListner.onData(clientSoclet, buff);
                }
               
                // socket.write(`Echo: ${data.toString()}`);
            });

            socket.on('end', () => {
                // console.log('server closed.' + this.host);
            });

            socket.on('error', (err: Error) => {
                console.error('Socket error:', err);
            });
        });

        this.host = "";
        this.port = 0;
    }

    public initAddress(host : string, port : number) : void {
        this.host = host;
        this.port = port;
    }
    
    public async listen() : Promise<void> {
        return new Promise<void>((resolve) => {
            this.server.listen(this.port, this.host, () => {
                console.log("TCP Server: Server listening on " + this.host + ":" + this.port);
                resolve();
            });
        });
    }

    public async close() : Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.server.close((err?: Error) => {
                if (err) {
                    reject(err);
                }
                else{
                     resolve();
                }
            });
        });
    }
}