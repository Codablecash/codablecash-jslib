import { ByteBuffer } from "../base_io/ByteBuffer";
import { AbstractBtreeKey } from "../btree/AbstractBtreeKey";
import { IBlockObject } from "../filestore_block/IBlockObject";
import { SystemTimestamp } from "./SystemTimestamp";
import { SystemTimestampKeyFactory } from "./SystemTimestampKeyFactory";

export class SystemTimestampKey extends AbstractBtreeKey {
	private tm : SystemTimestamp;
	private removeKey : IBlockObject | null;

    constructor(tm : SystemTimestamp) {
        super();
        this.tm = tm.copy();
        this.removeKey = null;
    }

    public isInfinity(): boolean {
        return false;
    }
    public isNull(): boolean {
        return false;
    }

    public binarySize() : number {
        let size = 4; // sizeof(uint32_t);
        size += this.tm.binarySize();

        return size;
    }

    public toBinary(out : ByteBuffer) : void {
        out.putInt(SystemTimestampKeyFactory.SYSTEM_TIMESTAMP_KEY);

        this.tm.toBinary(out);
    }

    public static fromBinary(input : ByteBuffer) : SystemTimestampKey {
        let tm = SystemTimestamp.fromBinary(input);
   
        return new SystemTimestampKey(tm);
    }

    public compareTo(key : AbstractBtreeKey) : number {
        if(key.isInfinity()){
            return -1;
        }
        else if(key.isNull()){
            return 1;
        }

        let other = <SystemTimestampKey>(key);
        //assert(other != nullptr);

        return this.tm.compareTo(other.tm);
    }

    public clone() : AbstractBtreeKey {
        return new SystemTimestampKey(this.tm);
    }

    public setRemoveKey(rkey : IBlockObject) : void {
        this.removeKey = null;
        this.removeKey = rkey.copyData();
    }
}