import { NullPointerException } from "../base/NullPointerException";
import { ByteBuffer } from "../base_io/ByteBuffer";
import { IBlockObject } from "../filestore_block/IBlockObject";
import { Btree } from "./Btree";
import { BtreeConfig } from "./BtreeConfig";

export class BtreeHeaderBlock implements IBlockObject {
    private rootFpos : number;
    private config : BtreeConfig | null;

    constructor() {
        this.rootFpos = 0;
        this.config = null;
    }

    public binarySize(): number {
        if(this.config != null){
            let size = this.config.binarySize();
            size += 8; // sizeof(this.rootFpos);
            return size;
        }
        throw new NullPointerException("BtreeHeaderBlock.binarySize()");
    }
    public toBinary(out: ByteBuffer): void {
        if(this.config != null){
            this.config.toBinary(out);
            out.putLong(this.rootFpos);
        }
    }
    public static fromBinary(input : ByteBuffer) {
        let header = new BtreeHeaderBlock();

        header.config = BtreeConfig.fromBinary(input);
        header.rootFpos = Number(input.getLong());

        return header;
    }

    public copyData(): IBlockObject {
        let inst = new BtreeHeaderBlock();
        inst.setRootFpos(this.rootFpos);
        inst.setConfig(this.getConfig());

        return inst;
    }

    public getConfig() : BtreeConfig {
        if(this.config != null){
            return this.config;
        }
        
        throw new NullPointerException("BtreeHeaderBlock.getConfig()");
    }
    public setConfig(config : BtreeConfig) {
        this.config = <BtreeConfig>config.copyData();
    }

    public getRootFpos() : number {
        return this.rootFpos;
    }
    public setRootFpos(rootFpos : number) {
        this.rootFpos = rootFpos;
    }
}
