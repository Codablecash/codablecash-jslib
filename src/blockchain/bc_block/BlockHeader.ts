import { Sha256 } from "../../base/crypto/Sha256";
import { ArrayList } from "../../db/base/ArrayList";
import { IComparable } from "../../db/base/IComparable";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { SystemTimestamp } from "../../db/base_timestamp/SystemTimestamp";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";
import { BigInteger } from "../../db/numeric/BigInteger";
import { AbstractBlockHeaderCommand } from "../bc_block_header_command/AbstractBlockHeaderCommand";
import { VotePart } from "../bc_block_vote/VotePart";
import { PoWNonce } from "../pow/PoWNonce";
import { Block } from "./Block";
import { BlockHeaderId } from "./BlockHeaderId";
import { BlockMerkleRoot } from "./BlockMerkleRoot";
import { BlockVersion } from "./BlockVersion";

export class BlockHeader implements IBlockObject, IComparable {
	private version : BlockVersion;

	private zone : number;
	private height : number;
	private timestamp : SystemTimestamp;
	/**
	 * supported the accuracy by network transfer protocol
	 */
	private nonceGeneratedtimestamp : SystemTimestamp;
	private id : BlockHeaderId; // built by buildHeaderId()

	private merkleRoot : BlockMerkleRoot;

	private lastid : BlockHeaderId;
	private nonce : PoWNonce;

	private votePart : VotePart;
	private lastNouceCalculated : SystemTimestamp;

	private commnads : ArrayList<AbstractBlockHeaderCommand>;

    constructor() {
        this.version = new BlockVersion(1, 0, 0);
        this.zone = 0;
        this.height = 0;
        this.id = new BlockHeaderId();

        this.timestamp = new SystemTimestamp();
        this.nonceGeneratedtimestamp = new SystemTimestamp();
        this.merkleRoot = BlockMerkleRoot.createZeroRoot();

        let tmp = new Uint8Array(32);
        tmp.fill(0);
        this.lastid = new BlockHeaderId(tmp, tmp.length);

        let defaultNonce = PoWNonce.getMaxBigInt().subtract(new BigInteger("FFFF", 16));
        this.nonce = new PoWNonce(defaultNonce);

        this.votePart = new VotePart();
        this.lastNouceCalculated = new SystemTimestamp();

        this.commnads = new ArrayList<AbstractBlockHeaderCommand>();       
    }
    public getVotePart() {
        return this.votePart;
    }
    public compareTo(other: IComparable | null): number {
        let o = <BlockHeader>other;
        if(o == null || o.id == null){
            if(this.id == null){
                return 0;
            }
            return 1;
        }
        if(this.id == null){
            return -1;
        }

        return this.id.compareTo(o.id);
    }

    public binarySize() : number {
        let total = this.version.binarySize() + 2 + 8;

        total += this.timestamp.binarySize();
        total += this.nonceGeneratedtimestamp.binarySize();
        total += this.merkleRoot.binarySize();
        total += this.lastid.binarySize();
        total += this.nonce.binarySize();
        total += this.votePart.binarySize();
        total += this.lastNouceCalculated.binarySize();

        total += 1; // sizeof(uint8_t);
        let maxLoop = this.commnads.size();
        for(let i = 0; i != maxLoop; ++i){
            let cmd = this.commnads.get(i);

            if(cmd != null){
                total += cmd.binarySize();
            }
        }

        return total;
    }

    public toBinary(out : ByteBuffer) : void {
        this.version.toBinary(out);
        out.putShort(this.zone);
        out.putLong(this.height);

        this.timestamp.toBinary(out);
        this.nonceGeneratedtimestamp.toBinary(out);
        this.merkleRoot.toBinary(out);
        this.lastid.toBinary(out);
        this.nonce.toBinary(out);
        this.votePart.toBinary(out);
        this.lastNouceCalculated.toBinary(out);

        let maxLoop = this.commnads.size();
        out.put(maxLoop);
        for(let i = 0; i != maxLoop; ++i){
            let cmd = this.commnads.get(i);
            if(cmd != null){
                cmd.toBinary(out);
            }
        }
    }

    public static createFromBinary(input : ByteBuffer) : BlockHeader {
        let header = new BlockHeader();

        let ver = BlockVersion.createFromBinary(input);
        header.setVersion(ver);

        let zone = input.getShort();
        header.setZone(zone);

        let height = input.getLong();
        header.setHeight(Number(height));

        header.timestamp = SystemTimestamp.fromBinary(input);

        header.nonceGeneratedtimestamp = SystemTimestamp.fromBinary(input);

        let root = BlockMerkleRoot.fromBinary(input);
        header.setMerkleRoot(root);

        header.lastid = BlockHeaderId.fromBinary(input);

        header.nonce = PoWNonce.createFromBinary(input);

        header.votePart = VotePart.createFromBinary(input);

        header.lastNouceCalculated = SystemTimestamp.fromBinary(input);

        let maxLoop = input.get();
        for(let i = 0; i != maxLoop; ++i){
            let cmd = AbstractBlockHeaderCommand.createFromBinary(input);

            header.commnads.addElement(cmd);
        }

        header.buildHeaderId();

        return header;
    }

    public buildHeaderId() : void {
        let total = 0;
        {
            total += this.version.binarySize() + 2 + 8;
            total += this.timestamp.binarySize();
            //total += this.nonceGeneratedtimestamp.binarySize(); // do not include calculated time

            total += this.merkleRoot.binarySize();
            total += this.lastid.binarySize();
            // total += this.nonce.binarySize();
            total += this.votePart.binarySize();
            total += this.lastNouceCalculated.binarySize();

            total += 1; //sizeof(uint8_t);
            let maxLoop = this.commnads.size();
            for(let i = 0; i != maxLoop; ++i){
                let cmd = this.commnads.get(i);
                if(cmd != null){
                    total += cmd.binarySize();
                }
            }
        }

        let buff = ByteBuffer.allocateWithEndian(total, true);
        this.version.toBinary(buff);
        buff.putShort(this.zone);
        buff.putLong(this.height);
        this.timestamp.toBinary(buff);
        //this.nonceGeneratedtimestamp.toBinary(buff);

        this.merkleRoot.toBinary(buff);
        this.lastid.toBinary(buff);
        // this.nonce.toBinary(buff);
        this.votePart.toBinary(buff);
        this.lastNouceCalculated.toBinary(buff);

        let maxLoop = this.commnads.size();
        buff.put(maxLoop);
        for(let i = 0; i != maxLoop; ++i){
            let cmd = this.commnads.get(i);
            if(cmd != null){
                cmd.toBinary(buff);
            }
        }

        let sha = Sha256.sha256(buff.toUint8Array(), true);
        sha.position(0);
        let newId = new BlockHeaderId(sha.toUint8Array(), sha.limit());

        this.setHeaderId(newId);
    }

    public copyData() : IBlockObject {
        let size = this.binarySize();

        let buff = ByteBuffer.allocateWithEndian(size, true);
        this.toBinary(buff);

        buff.position(0);
        return BlockHeader.createFromBinary(buff);
    }

    public setVersion(ver : BlockVersion) : void {
    	this.version = ver.clone()
    }
	public setZone(zone : number) : void {
		this.zone = zone;
	}
	public setHeight(height : number) : void {
		this.height = height;
	}
    public setMerkleRoot(merkleRoot : BlockMerkleRoot) {
        this.merkleRoot = <BlockMerkleRoot>(merkleRoot.copyData());
    }
    public setHeaderId(id : BlockHeaderId) : void {
        this.id = id;
    }

    public getId() {
        return this.id;
    }

    public getHeight() : number {
        return this.height;
    }
    public getLastHeaderId() : BlockHeaderId {
		return this.lastid;
	}
}