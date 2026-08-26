import { Sha256 } from "../../base/crypto/Sha256";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { AbstractMerkleElement } from "./AbstractMerkleElement";

export class MerkleElement extends AbstractMerkleElement {

    public calcHash() : void {
        let total = 0;

        let maxLoop = this.children.size();
        for(let i = 0; i != maxLoop; ++i){
            let ele = this.children.get(i);
            if(ele != null){
                total += ele.hashSize();
            }
        }


        let buff = ByteBuffer.allocateWithEndian(total, true);
        for(let i = 0; i != maxLoop; ++i){
            let ele = this.children.get(i);

            if(ele != null){
                let b = ele.getHash();
                buff.putByteBuffer(b);
            }
        }

        buff.position(0);
        this.hash = Sha256.sha256(buff.toUint8Array(), true);
    }

    public find(hash : ByteBuffer) : AbstractMerkleElement | null {
        if(this.isLeaf() && this.hash != null){
            let result = this.hash.binaryCmp(hash);
            //int result = Mem::memcmp(this.hash.array(), hash.array(), hash.limit());

            return result == 0 ? this : null;
        }

        let ret = null;

        let maxLoop = this.children.size();
        for(let i = 0; i != maxLoop; ++i){
            let ele = this.children.get(i);

            if(ele != null){
                ret = ele.find(hash);
                if(ret != null){
                    break;
                }
            }
        }

        return ret;
    }
}