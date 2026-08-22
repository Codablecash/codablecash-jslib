import { Base64 } from "../../blockchain/bc_base/Base64";

export class Aes256Cbc {
    public static readonly DEFAULT_IV : Uint8Array = new Uint8Array([0x86, 0xaf, 0xc4, 0x38, 0x68, 0xfe, 0xa6, 0xab, 0xd4, 0x0f, 0xbf, 0x6d, 0x5e, 0xd5, 0x09, 0x05]);
    public static readonly DEFAULT_Key256 : Uint8Array = new Uint8Array([0xf4, 0x15, 0x0d, 0x4a, 0x1a, 0xc5, 0x70, 0x8c, 0x29, 0xe4, 0x37, 0x74, 0x90, 0x45, 0xa3, 0x9a, 0x29
		, 0xe4, 0x37, 0x74, 0x1a, 0xc5, 0x70, 0x8c, 0xf4, 0x15, 0x0d, 0x4a, 0x90, 0x45, 0xa3, 0x9a]);
    
    private iv : Uint8Array;
    private key256 : Uint8Array;

    constructor(){
        this.iv = Aes256Cbc.DEFAULT_IV;
        this.key256 = Aes256Cbc.DEFAULT_Key256;
    }

    public setIv(iv : Uint8Array) : void {
        this.iv = iv;
    }
    public setKey(key256 : Uint8Array) : void {
        this.key256 = key256;
    }

    public encryptoPlainText(str : string) {
        let wkey = CryptoJS.lib.WordArray.create(this.key256);
        let wiv = CryptoJS.lib.WordArray.create(this.iv);

        const encrypted = CryptoJS.AES.encrypt(str, wkey, {
            iv: wiv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7, // PKCS7 is standard padding for AES
        });

        let strres = encrypted.toString();
        let binres = Base64.decodeString(strres).toUint8Array();

        let result = new Aes256CbcResult(binres.length, binres);
        return result;
    }

}

export class Aes256CbcResult {
	public length : number;
	public data : Uint8Array;

    constructor(length : number, data : Uint8Array){
        this.length = length;
        this.data = data;
    }
}