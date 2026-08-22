import CryptoJS from "crypto-js";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";


export class Sha256 {
    public static sha256(binary : Uint8Array, endian : boolean) {
           let arr = CryptoJS.lib.WordArray.create(binary);

        let result = CryptoJS.SHA256(arr);

        const words = result.words;
        const sigBytes = result.sigBytes;

        const u8 = new Uint8Array(result.sigBytes);
        for (let i = 0; i < sigBytes; i++) {
            // Extract each byte out of the 32-bit word (Big-Endian layout)
            const byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
            u8[i] = byte;
        }

        return ByteBuffer.wrapWithEndian(u8, sigBytes, true);
    }
}