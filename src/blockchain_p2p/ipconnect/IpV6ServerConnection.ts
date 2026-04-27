import { IpClientConnection } from "./IpClientConnection";
import { IServerSocket } from "./IServerSocket";
import { ISeverSocketDataListner } from "./IServerSocketDataListner";

import net = require('net');

export class IpV6ServerConnection implements IServerSocket {
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

                }
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
    public listen() : void {
        this.server.listen(this.port, "::", () => {
            console.log("TCP Server: Server listening on " + this.host + ":" + this.port);
        });
    }

    public close() : Promise<void> {
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