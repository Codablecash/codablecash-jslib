import { IServerSocket } from "./IServerSocket";
import net = require('net');

export class IpV6ServerConnection implements IServerSocket {
    private server: net.Server;
    private host : string;
    private port : number;

    constructor(){
        this.server = net.createServer((socket: net.Socket) =>{
            socket.on('data', (data: Buffer) => {
                socket.write(`Echo: ${data.toString()}`);

            });

            socket.on('end', () => {
                console.log('server closed.' + this.host);
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

    public close() : void {
        this.server.close();
    }
}