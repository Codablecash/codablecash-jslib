import { ScPublicKey } from "../../base/ecda/ScPublicKey";
import { Secp256k1CompressedPoint } from "../../base/ecda/Secp256k1CompressedPoint";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";
import { AbstractAddress } from "./AbstractAddress";

export class BalanceAddress extends AbstractAddress {
    public static readonly PREFIX = "cb";

    constructor(zone? : number, pubkey? : Secp256k1CompressedPoint){
        if(zone != undefined && pubkey != undefined){
            super(zone);
        }
        else {
            super(0);
        }
    }
    
    public createAddress(zone : number, publicKey : ScPublicKey) {
        let pubkey = Secp256k1CompressedPoint.compress(publicKey);
        let address = new BalanceAddress(zone, <Secp256k1CompressedPoint>(pubkey.copyData()));

        return address;
    }

    public getType(): number {
        throw new Error("Method not implemented.");
    }
    public binarySize(): number {
        throw new Error("Method not implemented.");
    }
    public toBinary(out: ByteBuffer): void {
        throw new Error("Method not implemented.");
    }
    public fromBinary(input: ByteBuffer): void {
        throw new Error("Method not implemented.");
    }

    public copyData(): IBlockObject {
        throw new Error("Method not implemented.");
    }

    public getPrefix(): string {
        return BalanceAddress.PREFIX;
    }
    public getBodyPart(): ByteBuffer {
        throw new Error("Method not implemented.");
    }
    
}