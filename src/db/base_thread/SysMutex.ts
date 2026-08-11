import AsyncLock = require("async-lock");


export class SysMutex {
    private lock : AsyncLock;
    private key : string;

    constructor() {
        this.lock = new AsyncLock();
        
        let obj : Object = new Object();
        this.key = obj.toString();
    }

    public acqire (callback : () => void ) : void {
        this.lock.acquire(this.key, callback);
    }

}