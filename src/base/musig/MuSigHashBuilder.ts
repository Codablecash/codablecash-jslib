import { ArrayList } from "../../db/base/ArrayList";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { BigInteger } from "../../db/numeric/BigInteger";
import { Secp256k1Point } from "../ecda/Secp256k1Point";

import sha256 from "fast-sha256";

export class MuSigHashBuilder {
    private list : ArrayList<ByteBuffer>;
    private sha256 : Buffer;

    constructor(){
        this.list = new ArrayList<ByteBuffer>();
        this.sha256 = Buffer.from({length: 32});
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

    public addArray(data : Uint8Array, length : number) {
        const buff = ByteBuffer.wrapWithEndian(data, length, true);
        buff.position(0);

        this.list.addElement(buff);
    } 

    public buildHash() {
        let binsize = this.binarySize();
        let buff = ByteBuffer.allocateWithEndian(binsize, true);

        let maxLoop = this.list.size();
        for(let i = 0; i != maxLoop; ++i){
            let b  = this.list.get(i);
            buff.putByteBuffer(b);
        }

        let data = buff.toUint8Array();

        let shaData = sha256(data);
        this.sha256 = Buffer.from(shaData);
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
        let buff = ByteBuffer.allocateWithEndian(32, true);
        buff.putBuffer(this.sha256);
        buff.position(0);

        return buff.toBigInteger();
    }
}