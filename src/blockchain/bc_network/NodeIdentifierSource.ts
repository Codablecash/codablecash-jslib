import { IKeyPair } from "../../base/crypto/IKeyPair";
import { Schnorr } from "../../base/crypto/Schnorr";
import { SchnorrKeyPair } from "../../base/crypto/SchnorrKeyPair";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";
import { BigInteger } from "../../db/numeric/BigInteger";
import { NodeIdentifier } from "./NodeIdentifier";

export class NodeIdentifierSource {
    private pair : IKeyPair;

    constructor(pair : IKeyPair){
        this.pair = pair.clone();
    }

    public static create() : NodeIdentifierSource {
        let pair : SchnorrKeyPair = Schnorr.generateKey();

        let src = new NodeIdentifierSource(pair);
        return src;
    }

    public toNodeIdentifier() : NodeIdentifier {
        let pubkey = this.pair.getPubKey();

        return new NodeIdentifier(pubkey);
    }

    public binarySize() : number {
        let total = this.pair.binarySize();

        return total;
    }

    public toBinary(out : ByteBuffer) : void {
        this.pair.toBinary(out);
    }

    public static createFromBinary(input : ByteBuffer) : NodeIdentifierSource {
        let pair = IKeyPair.createFromBinary(input);

        return new NodeIdentifierSource(pair);
    }

    public copyData() : IBlockObject {
        return new NodeIdentifierSource(this.pair.clone());
    }

    public getSecretKey() : BigInteger {
        return this.pair.getSecretKey();
    }
}