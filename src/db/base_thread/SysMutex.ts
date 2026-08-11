import AsyncLock = require("async-lock");
import { BigInteger } from "../numeric/BigInteger";


export class SysMutex {
    private lock : AsyncLock;
    private key : string;

    constructor() {
        this.lock = new AsyncLock();
        
        let r : bigint = BigInteger.getRandomBigInt(32);
        this.key = r.toString();
    }

    public acqire (callback : () => void ) : void {
        this.lock.acquire(this.key, callback);
    }

}