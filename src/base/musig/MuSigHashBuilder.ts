import { ArrayList } from "../../db/base/ArrayList";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { BigInteger } from "../../db/numeric/BigInteger";
import { Secp256k1Point } from "../ecda/Secp256k1Point";

export class MuSigHashBuilder {
    private list : ArrayList<ByteBuffer>;
    private sha256 : number[];

    constructor(){
        this.list = new ArrayList<ByteBuffer>();
        this.sha256 = Array.from({length: 32});
    }

    public add(pt : Secp256k1Point) : void {
        const buff = pt.to65Bytes();
        buff.position(0);

        this.list.addElement(buff);
    }

    public addBigInteger(bi : BigInteger) : void {
        const buff = bi.toBinary();
        buff.position(0);

        this.list.addElement(buff);
    }

    public addArray(data : number[], length : number) {
        const buff = ByteBuffer.wrapWithEndian(data, length, true);
        buff.position(0);

        this.list.addElement(buff);
    } 

    public buildHash() {

    }

    private binarySize() : number {
        let total = 0;

        const maxLoop = this.list.size();
        for(let i = 0; i != maxLoop; ++i){
            let b  = this.list.get(i);
            total += b.limit();
        }
        return total;
    }

    public getResultAsBigInteger() : BigInteger {
        // FIXME

        return new BigInteger(0n);
    }
}