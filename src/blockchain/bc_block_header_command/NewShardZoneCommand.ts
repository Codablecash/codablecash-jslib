import { NullPointerException } from "../../db/base/NullPointerException";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";
import { Block } from "../bc_block/Block";
import { AbstractBlockHeaderCommand } from "./AbstractBlockHeaderCommand";

export class NewShardZoneCommand extends AbstractBlockHeaderCommand {
	private newShardZone : number;
	private requestingZone : number;

	private genesisBlock : Block | null;

    constructor(){
        super(AbstractBlockHeaderCommand.NEW_SHARD_COMMAND);

        this.newShardZone = 0;
        this.requestingZone = 0;
        this.genesisBlock =  null;
    }


    public binarySize(): number {
        if(this.genesisBlock != null){
            let total = 2; // sizeof(uint16_t);

            total += 2; // sizeof(uint16_t);
            total += 2; //sizeof(uint16_t);
            total += this.genesisBlock.binarySize();

            return total;
        }
        throw new NullPointerException("NewShardZoneCommand.binarySize()");
    }
    public toBinary(out: ByteBuffer): void {
        if(this.genesisBlock != null){
            out.putShort(this.type);

            out.putShort(this.newShardZone);
            out.putShort(this.requestingZone);
            this.genesisBlock.toBinary(out);
            return;
        }
        throw new NullPointerException("NewShardZoneCommand.binarySize()");
    }
    public fromBinary(input : ByteBuffer) : void {
        this.newShardZone = input.getShort();
        this.requestingZone = input.getShort();

        this.genesisBlock = Block.createFromBinary(input);
    }

    public copyData(): IBlockObject {
        if(this.genesisBlock != null){
            let inst = new NewShardZoneCommand();
            inst.newShardZone = this.newShardZone;
            inst.requestingZone = this.requestingZone;
            inst.genesisBlock = this.genesisBlock.clone();

            return inst;
        }
        throw new NullPointerException("NewShardZoneCommand.copyData()");
    }
}