import { Aes256Cbc, Aes256CbcResult } from "../../base/crypto/Aes256Cbc";
import { Sha256 } from "../../base/crypto/Sha256";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { Base64 } from "../bc_base/Base64";
import { HdWalletSeed } from "../bc_wallet/HdWalletSeed";
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

    public encode(seed : HdWalletSeed) : HdWalletSeed {
        let size = seed.size();
        let data = seed.toArray();

        let result = this.__encode(data, size);

        return new HdWalletSeed(result.data, result.length);
    }

    public decode(encodedSeed : HdWalletSeed) : HdWalletSeed {
        let ar = encodedSeed.toArray();


        let buff = this.__decode(ar);

        let dec = Base64.decode(buff.toUint8Array(), buff.limit());

        return new HdWalletSeed(dec.toUint8Array(), dec.limit());
    }

    public __encode(data : Uint8Array, size : number) {
        let str = Base64.encode(data, size);

        let aes = new Aes256Cbc();
        aes.setKey(this.keybuff.toUint8Array());
        let result : Aes256CbcResult = aes.encryptoPlainText(str);

        return result;
    }

    public __decode(data : Uint8Array) : ByteBuffer {
        let aes = new Aes256Cbc();
        aes.setKey(this.keybuff.toUint8Array());

        let resstr = aes.decrypt(data, data.length);

        let b = Buffer.from(resstr, "utf8");
        return ByteBuffer.wrapWithEndian(b, b.length, true);
    }

}