import { Exception } from "./Exception";


export class NullPointerException extends Exception {
    
    public static nullAssert(val : any, message : string) {
        if(val == null){
            throw new NullPointerException(message);
        }
    }
}