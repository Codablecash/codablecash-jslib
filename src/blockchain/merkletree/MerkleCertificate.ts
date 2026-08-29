import { Sha256 } from "../../base/crypto/Sha256";
import { ArrayList } from "../../db/base/ArrayList";
import { NullPointerException } from "../../db/base/NullPointerException";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";
import { MerkleCertificateElement } from "./MerkleCertificateElement";

export class MerkleCertificate implements IBlockObject {
	private rootHash : ByteBuffer | null;
	private list : ArrayList<MerkleCertificateElement>;

    constructor() {
        this.rootHash = null;
        this.list = new ArrayList<MerkleCertificateElement>();
    }

	public size() : number {
		return this.list.size();
	}

    public setMerkleRoot(hash : ByteBuffer) : void {
        this.rootHash = hash.clone();
    }

    public addHash(element : MerkleCertificateElement) : void {
        this.list.addElement(element);
    }

    public certificate(data : ByteBuffer) : boolean {
        {
            let orgBuff = this.getOriginalHash();

            if(orgBuff.binaryCmp(data) != 0){
                return false;
            }
        }

        let fifo = new ArrayList<MerkleCertificateElement>;
        fifo.addAll(this.list);

        let first = fifo.remove(0);
        let hash : ByteBuffer;
        if(first != null){
            hash = first.getHash().clone();
        }else {
            throw new NullPointerException("MerkleCertificate.addHash()@first");
        }

        while(!fifo.isEmpty()){
            let element = fifo.remove(0);

            if(element != null){
                let elHash = element.getHash();

                let h : ByteBuffer;
                if(element.isLeft()){
                    h = this.joinHash(elHash, hash);
                }else{
                    h = this.joinHash(hash, elHash);
                }

                hash = h;
            }else {
                throw new NullPointerException("MerkleCertificate.addHash()@element");
            }

        }

        if(this.rootHash != null){
            let result = this.rootHash?.binaryCmp(hash); //Mem::memcmp(this.rootHash.array(), hash.array(), this.rootHash.limit());

            return result == 0;
        }
        throw new NullPointerException("MerkleCertificate.addHash()");
    }

    private joinHash(left : ByteBuffer, right : ByteBuffer) : ByteBuffer {
        let total = left.limit() + right.limit();
        let buff = ByteBuffer.allocateWithEndian(total, true);

        buff.putByteBuffer(left);
        buff.putByteBuffer(right);

        buff.position(0);

        return Sha256.sha256(buff.toUint8Array(), true);
    }

    public binarySize() : number {
        if(this.rootHash != null){
            let total = 1;
            total += this.rootHash.limit();

            let maxLoop = this.list.size();
            total += 2; // sizeof(uint16_t);

            for(let i = 0; i != maxLoop; ++i){
                let cert = this.list.get(i);

                if(cert != null){ // guard
                    total += cert.binarySize();
                }
            }

            return total;
        }
        throw new NullPointerException("MerkleCertificate.addHash()");
    }

    public toBinary(out : ByteBuffer) : void {
        if(this.rootHash) {
            let size = this.rootHash.limit();
            out.put(size);

            out.putArray(this.rootHash.toUint8Array(), 0, size);

            let maxLoop = this.list.size();
            out.putShort(maxLoop);

            for(let i = 0; i != maxLoop; ++i){
                let cert = this.list.get(i);

                if(cert != null){ // guard
                    cert.toBinary(out);
                }
            }
            return;
        }
        throw new NullPointerException("MerkleCertificate.addHash()");
    }

    public static createFromBinary(input : ByteBuffer) : MerkleCertificate {
        let inst = new MerkleCertificate();

        let size = input.get();
        inst.rootHash = input.getByteBuffer(size); // ByteBuffer::wrapWithEndian(data, size, true);

        let maxLoop = input.getShort();
        for(let i = 0; i != maxLoop; ++i){
            let cert = MerkleCertificateElement.createFromBinary(input);

            inst.list.addElement(cert);
        }

        return inst;
    }

    public copyData() : IBlockObject {
        let inst = new MerkleCertificate();
        inst.rootHash = this.rootHash != null ? this.rootHash.clone() : null;
        
        let maxLoop = this.list.size();
        for(let i = 0; i != maxLoop; ++i){
            let element = this.list.get(i);
            if(element != null){
                inst.list.addElement(<MerkleCertificateElement>element.copyData())
            }
        }

        return inst;
    }

    public getRootHash() : ByteBuffer {
        if(this.rootHash != null){
            return this.rootHash.clone();
        }
        throw new NullPointerException("MerkleCertificate.getRootHash()");
    }

    public getOriginalHash() : ByteBuffer {
        let first = this.list.get(0);

        if(first != null){
            let buff = first.getHash();

            return buff.clone();
        }
        throw new NullPointerException("MerkleCertificate.getOriginalHash()");
    }
}