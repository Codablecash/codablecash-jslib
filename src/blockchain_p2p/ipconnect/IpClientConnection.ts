
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { IClientSocket } from "./IClientSocket";
import net from "net";

export class IpClientConnection implements IClientSocket {
    private socket : net.Socket;

    constructor();
    constructor(socket : net.Socket)
    constructor(socket? : any){
        this.socket = socket == null ? null : socket;
    }

    public async connect(host : string, port : number) : Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.socket = net.createConnection({ host: host, port: port}, () => {
                resolve();
            });

            this.socket.on('error', (err) => {
                reject(err);
            });

            this.socket.on('close', () => {
                
            });
        });
    }

    public async read()  : Promise<ByteBuffer> {
        return new Promise<ByteBuffer>((resolve, reject) => {
            this.socket.on('data', (data) =>{
                const d = Buffer.from(data);
                const buff = new ByteBuffer(d.length);
                buff.putBuffer(d);

                resolve(buff);
            });

            this.socket.on('error', (err) => {
                reject(err);
            });
        });
    }

    public write(data : Uint8Array) : void {
        this.socket.write(data);
    }

    public close() : void {
        this.socket.destroy();
    }
}
