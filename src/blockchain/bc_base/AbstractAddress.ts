import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";
import { AddressDescriptor } from "./AddressDescriptor";
import { BalanceAddress } from "./BalanceAddress";

export abstract class AbstractAddress implements IBlockObject{
	public static readonly ADDRESS_TYPE_BALANCE = 1;
	public static readonly ADDRESS_TYPE_SMARTCONTRACT_MODULE = 2;
	public static readonly ADDRESS_TYPE_SMARTCONTRACT_INSTANCE = 3;

    protected zone : number;

    constructor(zone : number) {
        this.zone = zone;
    }

    public abstract getType() : number;

    public static createFromBinary(input : ByteBuffer) {
        let ret : AbstractAddress | null = null;

        let type = input.get();
        switch(type){
        case AbstractAddress.ADDRESS_TYPE_BALANCE:
            ret = new BalanceAddress();
            break;
        case AbstractAddress.ADDRESS_TYPE_SMARTCONTRACT_MODULE:
            //ret = new SmartcontractModuleAddress();
            break;
        case AbstractAddress.ADDRESS_TYPE_SMARTCONTRACT_INSTANCE:
            //ret = new SmartcontractInstanceAddress();
            break;
        default:
            return null;
        }

        if(ret != null){ // guard
            ret.fromBinary(input);
        }
        
        return ret;
    }

    public abstract binarySize(): number;
    public abstract toBinary(out: ByteBuffer): void;
    public abstract fromBinary(input : ByteBuffer) : void;

    public abstract copyData(): IBlockObject;

	public abstract getPrefix() : string;
	public abstract getBodyPart() : ByteBuffer;

    public toAddressDescriptor() : AddressDescriptor {
        let prefixstr = this.getPrefix();
        let prefix = Buffer.from(prefixstr, "utf8");

        /*
        char zonech[4];
        Mem::memset(zonech, 0, 4);
        ::sprintf(zonech, "%03d", (uint8_t)this->zone);
        */
        let zonestr = this.zone.toString(10).padStart(3, "0");
        let zonech = Buffer.from(zonestr, "utf8");

        let body = this.getBodyPart();

        body.position(0);
        let charstr = body.toUint8Array();
    
        let length = body.limit();

        return new AddressDescriptor(prefix, zonech, charstr, length);
    }
}