import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";
import { BigInteger } from "../../db/numeric/BigInteger";

export class PoWNonce implements IBlockObject {
    protected value : BigInteger;

    constructor(nonce : BigInteger){
        this.value = nonce.copy();
    }

    public static getMaxBigInt() : BigInteger {
        /**
         * 32 bytes value
         * FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF
         */
        let MAX_NONCE_BIG_INT = new BigInteger("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF", 16);

        return MAX_NONCE_BIG_INT;
    }

    public binarySize(): number {
        return 1 * 32;
    }
    public toBinary(out: ByteBuffer): void {
        let buff = this.tobyte32Buffer();
        buff.position(0);

        out.putByteBuffer(buff);
    }

    public copyData(): IBlockObject {
        throw new Error("Method not implemented.");
    }

    private tobyte32Buffer() : ByteBuffer {
        let buff = this.value.toBinary();

        return BigInteger.padBuffer(buff, 32);
    }

    public static createFromBinary(input : ByteBuffer) : PoWNonce {
        let tmp = input.getByteBuffer(32);
        tmp.position(0);

        let bint =  BigInteger.fromBinary(tmp);

        return new PoWNonce(bint);
    }

}