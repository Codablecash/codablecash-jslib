import { Exception } from "../base/Exception";

class BufferOverflowException extends Exception {
    constructor(msg : string){
        super(msg);
    }
}
