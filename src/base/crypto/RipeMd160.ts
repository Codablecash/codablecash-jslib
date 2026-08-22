import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { ripemd160 } from '@noble/hashes/legacy.js';

export class RipeMd160 {
    public static encode(inbuff : ByteBuffer) {
        let res = ripemd160(inbuff.toUint8Array());

        let buff = ByteBuffer.wrapWithEndian(res, res.length, true);
        return buff;
    }
}