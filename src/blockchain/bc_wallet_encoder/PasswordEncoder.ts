import { Sha256 } from "../../base/crypto/Sha256";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
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

    
}