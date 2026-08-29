import { Sha256 } from "../../base/crypto/Sha256";
import { NullPointerException } from "../../db/base/NullPointerException";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";
import { BlockHeaderCommandId } from "./BlockHeaderCommandId";
import { NewShardZoneCommand } from "./NewShardZoneCommand";
import { RecognizedNewShardCommand } from "./RecognizedNewShardCommand";


export abstract class AbstractBlockHeaderCommand implements IBlockObject {
	public static NEW_SHARD_COMMAND = 1;
	public static RECOGNIZED_SHARD_COMMAND = 2;

	protected type : number;
	protected commandId : BlockHeaderCommandId | null;
    
    constructor(type : number){
        this.type = type;
        this.commandId = null;
    }
    
    public abstract binarySize(): number;
    public abstract toBinary(out: ByteBuffer): void;
    public abstract fromBinary(input : ByteBuffer) : void;
    public abstract copyData(): IBlockObject;

    public static createFromBinary(input : ByteBuffer) : AbstractBlockHeaderCommand {
        let t = input.getShort();

        let ret;

        switch(t){
        case AbstractBlockHeaderCommand.NEW_SHARD_COMMAND:
            ret = new NewShardZoneCommand();
            break;
        case AbstractBlockHeaderCommand.RECOGNIZED_SHARD_COMMAND:
            ret = new RecognizedNewShardCommand();
            break;
        default:
            throw new NullPointerException("AbstractBlockHeaderCommand.createFromBinary()");
        }

        ret.fromBinary(input);
        ret.buildCommandId();

        return ret;
    }

    public buildCommandId() : void {
        let cap = this.binarySize();

        let buff = ByteBuffer.allocateWithEndian(cap, true);
        this.toBinary(buff);

        buff.position(0);
        let sha = Sha256.sha256(buff.toUint8Array(), true);

        this.commandId = new BlockHeaderCommandId(sha.toUint8Array(), sha.limit());
    } 
}