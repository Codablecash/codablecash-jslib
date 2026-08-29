import { ByteBuffer } from "../../db/base_io/ByteBuffer";


export class Base64 {
    public static readonly legalChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    private static IA : number[];
    private static init : boolean = false;

    public static encode(data : Uint8Array, len : number) {
        let start = 0;
        let buf = "";

        let end = len - 3;
        let i = start;
        let n = 0;

        while (i <= end) {
            let d = (((data[i]) & 0x0ff) << 16)
                    | (((data[i + 1]) & 0x0ff) << 8)
                    | ((data[i + 2]) & 0x0ff);
            buf += (Base64.legalChars[(d >> 18) & 63]);
            buf += Base64.legalChars[(d >> 12) & 63];
            buf += Base64.legalChars[(d >> 6) & 63];
            buf += Base64.legalChars[d & 63];
            i += 3;
            if (n++ >= 14) {
                n = 0;
                buf += " ";
            }
        }

        if(i == start + len - 2){
            let d = (((data[i]) & 0x0ff) << 16)
                    | (((data[i + 1]) & 255) << 8);
            buf += Base64.legalChars[(d >> 18) & 63];
            buf += Base64.legalChars[(d >> 12) & 63];
            buf += Base64.legalChars[(d >> 6) & 63];
            buf += "=";
        }
        else if(i == (start + len - 1) ){
            let d = (( data[i]) & 0x0ff) << 16;
            buf += Base64.legalChars[(d >> 18) & 63];
            buf += Base64.legalChars[(d >> 12) & 63];
            buf += "==";
        }

        return buf;
    }

    public static decodeString(str : string){
        let sArr = Buffer.from(str, "utf8");
        return Base64.decode(sArr, sArr.length);
    }
    /**
     * 
     * @param sArr Buffer.from([string], utf8)
     * @param sLen 
     * @returns 
     */
    public static decode(sArr : Uint8Array, sLen : number) {
        let IA = this.getIA();

        let sepCnt = 0; // Number of separator characters. (Actually illegal characters, but that's a bonus...)
        for (let i = 0; i < sLen; i++) // If input is "pure" (I.e. no line separators or illegal chars) base64 this loop can be commented out.
            if (IA[sArr[i]] < 0)
                sepCnt++;

        //assert((sLen - sepCnt) % 4 == 0);

        let pad = 0;
        for (let i = sLen; i > 1 && IA[sArr[--i]] <= 0;)
            if (sArr[i] == '='.charCodeAt(0))
                pad++;

        let len = ((sLen - sepCnt) * 6 >> 3) - pad;

        let dArr = ByteBuffer.allocateWithEndian(len, true);       // Preallocate byte[] of exact length

        for (let s = 0, d = 0; d < len;) {
            // Assemble three bytes into an int from four "valid" characters.
            let i = 0;
            for (let j = 0; j < 4; j++) { // j only increased if a valid char was found.
                let c = IA[sArr[s++]];
                if (c >= 0)
                    i |= c << (18 - j * 6);
                else
                    j--;
            }
            // Add the bytes
            //dArr[d++] = (byte)(i >> 16);
            dArr.puti(d++, i >> 16);

            if (d < len) {
                //dArr[d++] = (byte)(i >> 8);
                dArr.puti(d++, i >> 8);

                if (d < len){
                    // dArr[d++] = (byte) i;
                    dArr.puti(d++, i);
                }
            }
        }

        return dArr;
    }


    public static getIA() {

        if(!Base64.init){
            Base64.IA = Array<number>(256);
            Base64.IA.fill(-1);
            for (let i = 0; i < 64; i++){
                Base64.IA[Base64.legalChars[i].charCodeAt(0)] = i;
            }
            Base64.IA['='.charCodeAt(0)] = 0;

            Base64.init = true;
        }

        return Base64.IA;
    }
}