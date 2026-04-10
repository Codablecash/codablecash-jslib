import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { BigInteger } from "../../db/numeric/BigInteger";


export class Secp256k1Point {
    public static readonly p = new BigInteger(0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2Fn);
    public static readonly a = new BigInteger(0n);
    public static readonly b = new BigInteger(7n);

    public static readonly gX = new BigInteger(0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798n);
    public static readonly gY = new BigInteger(0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8n);

    public static readonly n = new BigInteger(0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141n); 

    public static readonly Zero = new BigInteger(0n);
    public static readonly One = new BigInteger(1n);
    public static readonly Two = new BigInteger(2n);
    public static readonly Three = new BigInteger(3n);

    protected x : BigInteger;
    protected y : BigInteger;

    public getX() : BigInteger {
        return this.x;
    }
    public getY() : BigInteger {
        return this.y;
    }

    constructor(x =  Secp256k1Point.gX, y =  Secp256k1Point.gY){
        this.x = new BigInteger(x.getValue());
        this.y = new BigInteger(y.getValue());
    }

    static getBasePoint() : Secp256k1Point {
        return new Secp256k1Point(Secp256k1Point.gX, Secp256k1Point.gY);
    }

    public multiple(value : BigInteger) : Secp256k1Point {
        let val = new BigInteger(value.getValue());
        while(val.compareTo(Secp256k1Point.Zero) < 0){
            val = val.add(Secp256k1Point.n);
        }

        return this.doMultiple(val);
    }

    private doMultiple(val : BigInteger) : Secp256k1Point {
        if(val.equals(Secp256k1Point.Zero)){
            return new Secp256k1Point(Secp256k1Point.Zero, Secp256k1Point.Zero);
        }
        if(val.equals(Secp256k1Point.One)){
            return new Secp256k1Point(this.x, this.y);
        }

        let mod2 = val.mod(Secp256k1Point.Two);
        let dblBase = val.subtract(mod2).divide(Secp256k1Point.Two);

        let base = this.doMultiple(dblBase);
        base = base.add(base);

        return mod2.equals(Secp256k1Point.Zero) ? base : base.add(this);
    }

    public add(pt : Secp256k1Point) : Secp256k1Point {
        if(pt.isO()){
            return new Secp256k1Point(this.x, this.y);
        }
        if(this.isO()){
            return new Secp256k1Point(pt.x, pt.y);
        }
        if(this.x.equals(pt.x) && this.y.add(pt.y).mod(Secp256k1Point.p).equals(Secp256k1Point.Zero)){
            return new Secp256k1Point(Secp256k1Point.Zero, Secp256k1Point.Zero);
        }

        let rambda = this.getRambda(pt);

        let x4 = rambda.pow(2n).subtract(this.x).subtract(pt.x).mod(Secp256k1Point.p);
        let y4 = rambda.multiply(this.x.subtract(x4)).subtract(this.y).mod(Secp256k1Point.p);
      
        return new Secp256k1Point(x4, y4);
    }

    public getRambda(pt : Secp256k1Point) : BigInteger {
        if(this.equals(pt)){
            let numerator = this.x.pow(2n).multiply(Secp256k1Point.Three);
            let denominator = this.y.multiply(Secp256k1Point.Two).modInverse(Secp256k1Point.p);

            return numerator.multiply(denominator).mod(Secp256k1Point.p);
        }

        let numerator = pt.y.subtract(this.y);
        let denominator = pt.x.subtract(this.x);

        denominator = denominator.modInverse(Secp256k1Point.p);

        return numerator.multiply(denominator).mod(Secp256k1Point.p);
    }

    public equals(pt : Secp256k1Point) : boolean {
        return this.x.equals(pt.x) && this.y.equals(pt.y);
    }

    public isO() : boolean {
        return this.x.equals(Secp256k1Point.Zero) && this.y.equals(Secp256k1Point.Zero);
    }

    public to65Bytes() : ByteBuffer {
        let buffx = this.x.toBinary();
        let buffy = this.y.toBinary();

        let buffxp = BigInteger.padBuffer(buffx, 32);
        let buffyp = BigInteger.padBuffer(buffy, 32);

        buffxp.position(0);
        buffyp.position(0);

        let size : number = 1 + buffxp.limit() + buffyp.limit();

        let ret = new ByteBuffer(size);
        ret.put(0x04);
        ret.putByteBuffer(buffxp);
        ret.putByteBuffer(buffyp);

        return ret;
    }

    public static from65Bytes(buff : ByteBuffer) : Secp256k1Point {
        buff.get(); // skip 0x04

        let datax = buff.getByteBuffer(32);
        let datay = buff.getByteBuffer(32);

        let xptr = datax.toBigInteger();
        let yptr = datay.toBigInteger();

        return new Secp256k1Point(xptr, yptr);
    }
}
