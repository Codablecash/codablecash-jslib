import { ByteBuffer } from "../../db/base_io/ByteBuffer";


export class Base58 {
    public static readonly ALPHABET : string = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    public static readonly ENCODED_ZERO : number = "1".charCodeAt(0);
    public static INDEXES : number[] = Base58.initIndex();

    private static initIndex() : number[] {
        let indexes : number[] = Array<number>(128);
        indexes.fill(-1);

        for (let i = 0; i < 58; i++) {
            let pos : number = Base58.ALPHABET.charCodeAt(i);
            indexes[pos] = i;
        }

        return indexes;
    }

    public static encode(input : Uint8Array, inputLength : number) {
        if (inputLength == 0) {
            return "";
        }

        // Count leading zeros.
        let zeros = 0;
        while (zeros < inputLength && input[zeros] == 0) {
            ++zeros;
        }

        let input2 = new Uint8Array(inputLength);
        input2.fill(0);
        for (let i = 0; i != inputLength; ++i) {
            input2[i] = input[i];
        }

        let encodedLength = inputLength * 2;
        let encoded = new Uint8Array(encodedLength); // upper bound
        encoded.fill(0);

        let outputStart = encodedLength;
        for (let inputStart = zeros; inputStart < inputLength;) {
            encoded[--outputStart] = Base58.ALPHABET.charCodeAt(Base58.divmod(input2, inputLength, inputStart, 256, 58)); //[Base58.divmod(input2, inputLength, inputStart, 256, 58)];
            if (input2[inputStart] == 0) {
                ++inputStart; // optimization - skip leading zeros
            }
        }

        //  while (outputStart < encodedLength && encoded[outputStart] == ENCODED_ZERO) {
        //      ++outputStart;
        //  }

        while (--zeros >= 0) {
            encoded[--outputStart] = Base58.ENCODED_ZERO;
        }

        let str : string = "";
        let maxLoop = encodedLength - outputStart;
        for(let i = 0; i != maxLoop; ++i){
            let ch : number = encoded[outputStart + i];
            str += String.fromCharCode(ch);
        }

        return str;
    }

    private static divmod(number : Uint8Array, numberLength : number, firstDigit : number, base : number, divisor : number) : number {
        let remainder = 0;
        for (let i = firstDigit; i < numberLength; i++) {
            let digit = (number[i] & 0xFF);
            let temp = remainder * base + digit;
            number[i] = Math.trunc(temp / divisor);
            remainder = temp % divisor;
        }
        return remainder;
    }

    public static decode(input : string) {
        if(input.length == 0) {
            return null;
        }

        let input58Length = input.length;
        let input58 = new Uint8Array(input.length);
        input58.fill(0);

        for (let i = 0; i < input.length; ++i) {
            let c = input.charCodeAt(i);
            let digit = c < 128 ? Base58.INDEXES[c] : -1;
            if (digit < 0) {
                return null;
            }
            input58[i] = digit;
        }

        let zeros = 0;
        while (zeros < input58Length && input58[zeros] == 0) {
            ++zeros;
        }

        let decodedLength = input.length;
        let decoded = new Uint8Array(decodedLength);
        decoded.fill(0);

        let outputStart = decodedLength;
        for (let inputStart = zeros; inputStart < input58Length; ) {
            decoded[--outputStart] = Base58.divmod(input58, input58Length, inputStart, 58, 256);
            if (input58[inputStart] == 0) {
                ++inputStart;
            }
        }

        while (outputStart < decodedLength && decoded[outputStart] == 0) {
            ++outputStart;
        }

        let result = ByteBuffer.allocateWithEndian(decodedLength - (outputStart - zeros), true);

        result.putArray(decoded, outputStart - zeros, decodedLength - (outputStart - zeros));

        return result;
    }
}