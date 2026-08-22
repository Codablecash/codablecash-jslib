import { Aes256Cbc, Aes256CbcResult } from "../../base/crypto/Aes256Cbc";
import { Sha256 } from "../../base/crypto/Sha256";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { Base64 } from "../bc_base/Base64";
import { IWalletDataEncoder } from "./IWalletDataEncoder";


export class PasswordEncoder implements IWalletDataEncoder {
	private password : string;
	private keybuff : ByteBuffer;

    constructor(password : string){
        this.password = password;

        {
            let p : Uint8Array = Buffer.from(this.password, "utf8");

            this.keybuff = Sha256.sha256(p, true);
            this.keybuff.position(0);
        }
    }

    public encode(data : Uint8Array, size : number) {
        let str = Base64.encode(data, size);

        let aes = new Aes256Cbc();
        aes.setKey(this.keybuff.toUint8Array());
        let result : Aes256CbcResult = aes.encryptoPlainText(str);

        return result;
    }
    
}