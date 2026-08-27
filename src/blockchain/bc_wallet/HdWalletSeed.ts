import { Sha256 } from "../../base/crypto/Sha256";
import { NullPointerException } from "../../db/base/NullPointerException";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { Abstract32BytesId } from "../bc_base/Abstract32BytesId";
import { IWalletDataEncoder } from "../bc_wallet_encoder/IWalletDataEncoder";

export class HdWalletSeed extends Abstract32BytesId {
    constructor(binary? : Uint8Array, length? : number){
        super(binary, length);        
    }

    public static newSeed() : HdWalletSeed {
        let buff = HdWalletSeed.makeRandom16Bytes();
        buff.position(0);

        let walletSeed = new HdWalletSeed();
        walletSeed.id = ByteBuffer.wrapWithEndian(buff.toUint8Array(), buff.capacity(), true);

        return walletSeed;       
    }

    public encodedSeed(encoder : IWalletDataEncoder) : HdWalletSeed {
        return encoder.encode(this);
    }

    public copyData() {
        if(this.id != null){
            let data = this.id.toUint8Array();
            return new HdWalletSeed(data, data.length);
        }
        throw new NullPointerException("HdWalletSeed.size()"); 
    }

	public getByteBuffer() : ByteBuffer {
        if(this.id != null){
            return this.id;
        }
		throw new NullPointerException("HdWalletSeed.getByteBuffer()"); 
	}

    public indexedSeed(accountIndex : number) : HdWalletSeed {
        if(this.id != null){
            let cap = this.id.limit() + 8; //sizeof(uint64_t);
            let buff = ByteBuffer.allocateWithEndian(cap, true);

            buff.putLong(accountIndex);

            this.id.position(0);
            buff.putByteBuffer(this.id);

            let id = Sha256.sha256(buff.toUint8Array(), true);

            let walletSeed = new HdWalletSeed();
            walletSeed.id = id;

            return walletSeed;
        }
        throw new NullPointerException("HdWalletSeed.getByteBuffer()"); 
    }
}