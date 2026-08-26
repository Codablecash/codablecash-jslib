import { Sha256 } from "../../base/crypto/Sha256";
import { ArrayList } from "../../db/base/ArrayList";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";
import { AbstractBlockchainTransaction } from "../bc_trx/AbstractBlockchainTransaction";


function implementsIBlockObject(arg: any): arg is IBlockObject {
  return arg !== null &&
    typeof arg === "object";
}

export class MerkleTree {
    private list : ArrayList<ByteBuffer>;

    constructor(){
        this.list = new ArrayList<ByteBuffer>();
    }

    public addElement(arg0 : any, arg1? : number) : void {
        if(arg0 instanceof Uint8Array && arg1 != undefined){
            this.addArray(arg0 , arg1);
        }
        else if(arg0 instanceof AbstractBlockchainTransaction) {
            this.addTransaction(arg0);
        }
        else if(arg0 instanceof ByteBuffer) {
            this.addByteBuffer(arg0);
        }
        else if(implementsIBlockObject(arg0)) {
            this.addIBlockObject(arg0);
        }
        else if(typeof arg0 == "number") {
            this.addNumber(arg0);
        }
        else if(typeof arg0 == "bigint") {
            this.addBigInt(arg0);
        }
    }

    private addArray(hash : Uint8Array, size : number){
        let buff = ByteBuffer.wrapWithEndian(hash, size, true);
        this.list.addElement(buff);
    }
    private addIBlockObject(obj : IBlockObject){
        let size = obj.binarySize();
        let buff = ByteBuffer.allocateWithEndian(size, true);
        obj.toBinary(buff);

        buff.position(0);

        let hash = Sha256.sha256(buff.toUint8Array(), true);
        hash.position(0);

        this.addArray(hash.toUint8Array(), hash.limit());
    }
    private addTransaction(trx : AbstractBlockchainTransaction){
        let trxId = trx.getTransactionId();

        let size = trxId.size();
        let hash = trxId.toArray();

        this.addArray(hash, size);
    }
    private addByteBuffer(b: ByteBuffer){
        this.addArray(b.toUint8Array(), b.limit());
    }
    private addNumber(num : number){
        this.addBigInt(BigInt(num));
    }
    private addBigInt(byte8 : bigint){
        let buff = ByteBuffer.allocateWithEndian(8, true);
        buff.putLong(byte8);

        buff.position(0);
        let hash = Sha256.sha256(buff.toUint8Array(), true);

        hash.position(0);
        this.addByteBuffer(hash);
    }

}
