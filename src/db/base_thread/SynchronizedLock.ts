import { SysMutex } from "./SysMutex";


export class SynchronizedLock extends SysMutex {
    private sab: SharedArrayBuffer;
    private int32: Int32Array;

    constructor() {
        super();
        this.sab = new SharedArrayBuffer(1024);
        this.int32 = new Int32Array(this.sab);

         Atomics.store(this.int32, 0, 0);
    }
   
    public wait() :void {
        Atomics.store(this.int32, 0, 0);
        Atomics.wait(this.int32, 0, 0);
    }

    public notify() : void {
        Atomics.store(this.int32, 0, 1);
        Atomics.notify(this.int32, 0);
    }
}