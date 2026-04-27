

export interface IServerSocket {
    initAddress(host : string, port : number) : void;
    listen() : void;
    close() : void;
    
}