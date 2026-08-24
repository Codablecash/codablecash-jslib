import { RipeMd160 } from "../../base/crypto/RipeMd160";
import { Sha256 } from "../../base/crypto/Sha256";
import { ScPublicKey } from "../../base/ecda/ScPublicKey";
import { Secp256k1CompressedPoint } from "../../base/ecda/Secp256k1CompressedPoint";
import { NullPointerException } from "../../db/base/NullPointerException";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";
import { AbstractAddress } from "./AbstractAddress";
import { AddressDescriptor } from "./AddressDescriptor";

export class BalanceAddress extends AbstractAddress {
    public static readonly PREFIX = "cb";

    private pubkey : Secp256k1CompressedPoint | null;

    constructor(zone? : number, pubkey? : Secp256k1CompressedPoint){
        if(zone != undefined && pubkey != undefined){
            super(zone);
            this.pubkey = <Secp256k1CompressedPoint>pubkey.copyData();
        }
        else {
            super(0);
            this.pubkey = null;
        }
    }
    
    public static createAddress(zone : number, publicKey : ScPublicKey) {
        let pubkey = Secp256k1CompressedPoint.compress(publicKey);
        let address = new BalanceAddress(zone, <Secp256k1CompressedPoint>(pubkey.copyData()));

        return address;
    }

    public getType(): number {
        return AbstractAddress.ADDRESS_TYPE_BALANCE;
    }
    public binarySize(): number {
        if(this.pubkey != null){
            let total = 1; // sizeof(uint8_t);
            total += 2; // sizeof(this.zone);
            total += this.pubkey.binarySize();

            return total;
        }
        throw new NullPointerException("BalanceAddress.binarySize()");
    }

    public toBinary(out: ByteBuffer): void {
        if(this.pubkey != null){
            out.put(this.getType());
            out.putShort(this.zone);
            this.pubkey.toBinary(out);
            return;
        }
        throw new NullPointerException("BalanceAddress.toBinary()");
    }
    public fromBinary(input: ByteBuffer): void {
        this.zone = input.getShort();
        this.pubkey = Secp256k1CompressedPoint.fromBinary(input);
    }

    public copyData(): IBlockObject {
        if(this.pubkey != null){
            return new BalanceAddress(this.zone, <Secp256k1CompressedPoint>(this.pubkey.copyData()));
        }
        throw new NullPointerException("BalanceAddress.copyData()");
    }

    public getPrefix(): string {
        return BalanceAddress.PREFIX;
    }
    public getBodyPart(): ByteBuffer {
        if(this.pubkey != null){
            let size = this.pubkey.binarySize();
            let buff = ByteBuffer.allocateWithEndian(size, true);
            this.pubkey.toBinary(buff);

            // sha256
            let sha = Sha256.sha256(buff.toUint8Array(), true);

            // RIPEMD-160
            let ripe : string = RipeMd160.encode(sha);

            let ripebuffer = Buffer.from(ripe, "utf8");

            return ByteBuffer.wrapWithEndian(ripebuffer, ripebuffer.length, true);
        }
        throw new NullPointerException("BalanceAddress.getBodyPart()");
    }
    
    public toAddressDescriptor() : AddressDescriptor {
        let prefix = Buffer.from(this.getPrefix(), "utf8");

        let zonech = this.zone.toString(16).padStart(3, "0");
        let zonearray = Buffer.from(zonech, "utf8");

        let body = this.getBodyPart();
        body.position(0);
        let charstr = body.toUint8Array();
        let length = body.limit();

        return new AddressDescriptor(prefix, zonearray, charstr, length);
    }
}