import { Exception } from "../base/Exception";

export class BufferOverflowException extends Exception {
    constructor(msg : string){
        super(msg);
    }
}
