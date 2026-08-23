import { Sha256 } from "../../base/crypto/Sha256";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";
import { AddressDescriptor } from "../bc_base/AddressDescriptor";
import { BloomFilter } from "./BloomFilter";
import { BloomHash1024 } from "./BloomHash1024";

export class BloomFilter1024 extends BloomFilter implements IBlockObject {

    constructor(){
        super(1024);
    }

    public addAddressDesc(addressDesc : AddressDescriptor) {
        let str = addressDesc.toCString();
   
        let binary = Buffer.from(str, "utf8");

        super.add(binary, binary.length);
    }

    public checkBytesAddressDesc(addressDesc : AddressDescriptor) {
        let str = addressDesc.toCString();

        let binary = Buffer.from(str, "utf8");

        return super.checkBytes(binary, binary.length);
    }

    binarySize(): number {
        return this.__binarySize();
    }
    toBinary(out: ByteBuffer): void {
        this.__toBinary(out);
    }
    public static createFromBinary(input : ByteBuffer) : BloomFilter1024 {
        let filter = new BloomFilter1024();
        filter.__fromBinary(input);

        return filter;
    }

    copyData(): IBlockObject {
        throw new Error("Method not implemented.");
    }

    public getHash(addressDesc : AddressDescriptor) : BloomHash1024 {
        let str = addressDesc.toCString();

        let arstr = Buffer.from(str, "utf8");

        let bb = Sha256.sha256(arstr, true);
        bb.position(0);

        let l = BigInt(this.bitlength);

        let _v1 = (bb.getLong());
        let _v2 = (bb.getLong());
        let _v3 = (bb.getLong());

        let v1 = Number(_v1 % l);
        let v2 = Number(_v2 % l);
        let v3 = Number(_v3 % l);

        return new BloomHash1024(v1, v2, v3);
    }

    public checkBytes1024(hash : BloomHash1024) {
        let v1 = hash.getValue(0);
        let v2 = hash.getValue(1);
        let v3 = hash.getValue(2);

        return super.__checkBytes(v1, v2, v3);
    }
}