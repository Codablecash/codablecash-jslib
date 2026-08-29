import { NullPointerException } from "../../db/base/NullPointerException";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { BinaryValueConfigStoreValue } from "./BinaryValueConfigStoreValue";
import { LongValueConfigStoreValue } from "./LongValueConfigStoreValue";
import { ShortValueConfigStoreValue } from "./ShortValueConfigStoreValue";

export abstract class AbstractConfigStoreElement {
    public static readonly TYPE_LONG_VALUE = 1;
    public static readonly TYPE_SHORT_VALUE = 2;
    public static readonly TYPE_BINARY_VALUE = 10;

    protected type : number;

    constructor(type : number) {
        this.type = type;
    }

    public abstract binarySize() : number;
    public abstract toBinary(out : ByteBuffer) : void;
    public abstract fromBinary(input : ByteBuffer) : void;

    public static createFromBinary(input : ByteBuffer) : AbstractConfigStoreElement {
        let t = input.get();
        let ret : AbstractConfigStoreElement | null = null;
        
        if(t == AbstractConfigStoreElement.TYPE_LONG_VALUE){
            ret = new LongValueConfigStoreValue();
        }
        else if(t == AbstractConfigStoreElement.TYPE_SHORT_VALUE){
            ret = new ShortValueConfigStoreValue();
        }
        else if(t == AbstractConfigStoreElement.TYPE_BINARY_VALUE){
            ret = new BinaryValueConfigStoreValue();
        }
        else{
            throw new NullPointerException("AbstractConfigStoreElement.createFromBinary()");
        }

        ret.fromBinary(input);

        return ret;
    }
}