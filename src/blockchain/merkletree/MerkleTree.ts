import { Sha256 } from "../../base/crypto/Sha256";
import { ArrayList } from "../../db/base/ArrayList";
import { NullPointerException } from "../../db/base/NullPointerException";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";
import { AbstractBlockchainTransaction } from "../bc_trx/AbstractBlockchainTransaction";
import { AbstractMerkleElement } from "./AbstractMerkleElement";
import { BlankMerkleElement } from "./BlankMerkleElement";
import { MarkleElementFifo } from "./MarkleElementFifo";
import { MerkleCertificate } from "./MerkleCertificate";
import { MerkleCertificateElement } from "./MerkleCertificateElement";
import { MerkleElement } from "./MerkleElement";


function implementsIBlockObject(arg: any): arg is IBlockObject {
  return arg !== null &&
    typeof arg === "object";
}

export class MerkleTree {
    private root : AbstractMerkleElement | null;
    private list : ArrayList<ByteBuffer>;

    constructor(){
        this.root = null;
        this.list = new ArrayList<ByteBuffer>();
    }

	public getRoot() : AbstractMerkleElement {
        if(this.root != null){
            return this.root;
        }
		throw new NullPointerException("MerkleTree.getRoot()");
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

    public pack() : void {
        let fifo = new MarkleElementFifo();

        let maxLoop = this.list.size();
        for(let i = 0; i != maxLoop; ++i){
            let buff = this.list.get(i);

            if(buff != null){ // guard
                let element = new MerkleElement();
                element.setHash(buff);

                fifo.addElement(element);
            }
        }

        while(fifo.size() != 1){
            let lastFifo = fifo;

            fifo = this.packFifo(lastFifo);
        }

        this.root = fifo.out();
    }

    public packFifo(fifo : MarkleElementFifo) : MarkleElementFifo {
        let newFifo = new MarkleElementFifo();

        while(!fifo.isEmpty()){
            let newElement = new MerkleElement();
            newFifo.addElement(newElement);

            let ele = fifo.out();
            newElement.addChild(ele);

            if(!fifo.isEmpty()){
                ele = fifo.out();
                newElement.addChild(ele);
            }else{
                // blank node
                newElement.addChild(new BlankMerkleElement());
            }

            newElement.calcHash();
        }

        return newFifo;
    }

    public makeCertificate(arg0 : ByteBuffer | Uint8Array, arg1? : number) : MerkleCertificate | null {
        if(arg0 instanceof Uint8Array && arg1 != undefined){
            return this.__makeCertificateArray(arg0, arg1);
        }
        return this.__makeCertificate(<ByteBuffer>arg0);
    }

    private __makeCertificate(b : ByteBuffer) : MerkleCertificate | null {
        if(this.root != null){
            let cert = new MerkleCertificate();

            let rootHash = this.root.getHash();
            cert.setMerkleRoot(rootHash);

            let element = this.root.find(b);
            if(element == null){
                return null;
            }
            else if(element.isRoot()){
                let hash = element.getHash();
                let me = new MerkleCertificateElement(hash, true);
                cert.addHash(me);

                return cert;
            }
            else {
                let hash = element.getHash();
                let me = new MerkleCertificateElement(hash, element.isLeft());
                cert.addHash(me);
            }

            while(!element.isRoot()){
                element = element.getAnotherPair();
                let hash = element.getHash();

                let me = new MerkleCertificateElement(hash, element.isLeft());
                cert.addHash(me);

                element = element.getParent();
            }

            return cert;
        }
        throw new NullPointerException("MerkleTree.__makeCertificate()");
    }

    private __makeCertificateArray(hash : Uint8Array, size : number) : MerkleCertificate | null {
        let buff = ByteBuffer.wrapWithEndian(hash, size, true);

        return this.__makeCertificate(buff);
    }

}
