

import fs from 'node:fs';

export class FileDescriptor {
    private fd : number;
    private position : number;
    private sync : boolean;

    private pathname : string;

    constructor(fd : number, path : string){
        this.fd = fd;
        this.position = 0;
        this.sync = false;
        this.pathname = path;
    }

    public getFd() : number {
        return this.fd;
    }
    public setFd(fd : number) : void {
        this.fd = fd;
    }

    public setSync(bl : boolean) : void {
        this.sync = bl;
    }
    public isSync() : boolean {
        return this.sync;
    }
    public incPosition(n : number) : void {
        this.position += n;
    }

    public setPosition(pos : number) : void {
        this.position = pos;
    }
    public getPosition() : number {
        return this.position;
    }

    public isOpened() : boolean {
        return this.fd > 0;
    }

    public length() : number {
        const status = fs.statSync(this.pathname);
        return status.size;
    }
}