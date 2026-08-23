import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import CryptoJS from 'crypto-js';

export class RipeMd160 {
    public static encode(inbuff : ByteBuffer) : string {
        const ar = inbuff.toUint8Array();
        const message = new TextDecoder().decode(ar);

        const hash = CryptoJS.RIPEMD160(message);

        return hash.toString();
    }
}