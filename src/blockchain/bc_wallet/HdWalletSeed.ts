import { NullPointerException } from "../../db/base/NullPointerException";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { Abstract32BytesId } from "../bc_base/Abstract32BytesId";

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

    public copyData() {
        if(this.id != null){
            let data = this.id.toUint8Array();
            return new HdWalletSeed(data, data.length);
        }
        throw new NullPointerException("Abstract32BytesId.size()"); 
    }

}