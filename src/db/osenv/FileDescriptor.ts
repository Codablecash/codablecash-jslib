

export class FileDescriptor {
    private fd : number;
    private position : number;
    private sync : boolean;

    constructor(fd : number){
        this.fd = fd;
        this.position = 0;
        this.sync = false;
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

    public setPosition(pos : number) : void {
        this.position = pos;
    }


    public isOpened() : boolean {
        return this.fd > 0;
    }
}