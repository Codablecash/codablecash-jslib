import { ByteBuffer } from "../../db/base_io/ByteBuffer";

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
        this.prefix = cstr.slice(0, AddressDescriptor.PREFIX_LENGTH);
        this.zone = cstr.slice(AddressDescriptor.PREFIX_LENGTH, AddressDescriptor.PREFIX_LENGTH + AddressDescriptor.ZONE_LENGTH);
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
        this.makeCheckDigit();
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

        let checkdigitstr = checkdigit.toString(10).padStart(2);
        this.checkDigit = Buffer.from(checkdigitstr, "utf8");

        /*
        int checkdigit = total % 99;
        char tmp[3];
        Mem::memset(tmp, 0, 3);

        ::sprintf(tmp, "%02d", checkdigit);

        Mem::memcpy(this.checkDigit, tmp, 2);*/
    }
}