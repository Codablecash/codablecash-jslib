import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { AddressCheckDigitException } from "./AddressCheckDigitException";
import { Base58 } from "./Base58";

export class AddressDescriptor {
    public static PREFIX_LENGTH : number = 2;
    public static ZONE_LENGTH : number = 3;
    public static CHECKDIGIT_LENGTH : number = 2;

    private prefix : Uint8Array;
    private zone : Uint8Array;
    private body : ByteBuffer;
    private checkDigit : Uint8Array;
    
    constructor(prefix : Uint8Array | string, zone? : Uint8Array, body? : Uint8Array, bodylength? : number){
        this.prefix = new Uint8Array(2);
        this.zone = new Uint8Array(3);
        this.body = ByteBuffer.allocateWithEndian(8, true);
        this.checkDigit = new Uint8Array(2);

        if(typeof prefix != "string" && zone != undefined && body != undefined && bodylength != undefined){
            this.prefix = prefix;
            this.zone = zone;
            this.body = ByteBuffer.wrapWithEndian(body, body.length, true);

            this.makeCheckDigit();
        }
        else if(typeof prefix == "string"){
            let str = Buffer.from(prefix);
            this.importCstring(str);
        }
        else {
            this.importCstring(prefix);
        }

    }

    private importCstring(cstr : Uint8Array){
        let length = cstr.length;

        let start = 0;
        this.prefix = cstr.slice(start, AddressDescriptor.PREFIX_LENGTH);
        
        start += AddressDescriptor.PREFIX_LENGTH;
        this.zone = cstr.slice(start, start + AddressDescriptor.ZONE_LENGTH);

        start += AddressDescriptor.ZONE_LENGTH;
	    let bodylength = length - AddressDescriptor.PREFIX_LENGTH - AddressDescriptor.ZONE_LENGTH - AddressDescriptor.CHECKDIGIT_LENGTH;
        let bodycstr : Uint8Array = cstr.slice(start, start + bodylength);

        let str = new TextDecoder().decode(bodycstr);

        let decodedBody = Base58.decode(str);
        if(decodedBody != null){
            this.body = decodedBody;
        }

        // check checkdigits
        this.makeCheckDigit();

        start += bodylength;
        let __checkDigit = cstr.slice(start, start + AddressDescriptor.CHECKDIGIT_LENGTH);
        if(__checkDigit != this.checkDigit){
            throw new AddressCheckDigitException("Wrong address descriptor");
        }
/*
	int length = Mem::strlen(cstr);

	Mem::memcpy(this.prefix, cstr, AddressDescriptor::PREFIX_LENGTH);
	Mem::memcpy(this.zone, cstr + AddressDescriptor::PREFIX_LENGTH, AddressDescriptor::ZONE_LENGTH);

	int bodylength = length - AddressDescriptor::PREFIX_LENGTH - AddressDescriptor::ZONE_LENGTH
			- AddressDescriptor::CHECKDIGIT_LENGTH;
	char* bodycstr = new char[bodylength + 1];
	Mem::memset(bodycstr, 0, bodylength + 1);
	StackArrayRelease<const char> __st_bodycstr(bodycstr);

	Mem::memcpy(bodycstr, cstr + AddressDescriptor::PREFIX_LENGTH + AddressDescriptor::ZONE_LENGTH, bodylength);

	UnicodeString str(bodycstr);
	this.body = Base58::decode(&str);

	// check checkdigits
	char __checkDigit[2];
	Mem::memcpy(__checkDigit, cstr + AddressDescriptor::PREFIX_LENGTH + AddressDescriptor::ZONE_LENGTH + bodylength, AddressDescriptor::CHECKDIGIT_LENGTH);

	makeCheckDigit();

	int cmp = Mem::memcmp(this.checkDigit, __checkDigit, AddressDescriptor::CHECKDIGIT_LENGTH);
	ExceptionThrower<AddressCheckDigitException>::throwExceptionIfCondition(cmp != 0, L"Check digit error.", __FILE__, __LINE__);
*/
    }

    public makeCheckDigit() {
        this.body.position(0);
        let bodybin = this.body.toUint8Array();

        let total = 0;

        let maxLoop = this.body.limit();
        for(let i = 0; i != maxLoop; ++i){
            total += bodybin[i];
        }

        let checkdigit = total % 99;

        let checkdigitstr = checkdigit.toString(10).padStart(2, "0");
        this.checkDigit = Buffer.from(checkdigitstr, "utf8");
    }
}