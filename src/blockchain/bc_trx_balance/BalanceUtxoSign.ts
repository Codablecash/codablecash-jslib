import { Secp256k1CompressedPoint } from "../../base/ecda/Secp256k1CompressedPoint";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";
import { BigInteger } from "../../db/numeric/BigInteger";

export class BalanceUtxoSign implements IBlockObject {
    private R : Secp256k1CompressedPoint;
	private s : BigInteger;

    constructor(R : Secp256k1CompressedPoint, s : BigInteger){
        this.R = <Secp256k1CompressedPoint>R.copyData();
        this.s = s.copy();
    }

    public binarySize() : number {
        let total = this.R.binarySize();
        //total += s.binarySize();
        total += 1 * 32;

        return total;
    }

    public toBinary(out : ByteBuffer) : void {
        this.R.toBinary(out);

        let tmp = this.s.toBinary();
        tmp.position(0);
        let bin32 = BigInteger.padBuffer(tmp, 32);
        bin32.position(0);
        out.putByteBuffer(bin32);
    }

    public static fromBinary(input : ByteBuffer) : BalanceUtxoSign {
        let pt = Secp256k1CompressedPoint.fromBinary(input);
        
        let buff = input.getByteBuffer(32);
        let bi = buff.toBigInteger();

        return new BalanceUtxoSign(pt, bi);
    }

    public copyData() : IBlockObject {
        return new BalanceUtxoSign(this.R, this.s);
    }

	public getR() : Secp256k1CompressedPoint {
		return this.R;
	}
	public gets() : BigInteger {
		return this.s;
	}
}