import { ByteBuffer } from "../../../db/base_io/ByteBuffer";
import { AbstractBtreeDataFactory } from "../../../db/btree/AbstractBtreeDataFactory";
import { AbstractBtreeKey } from "../../../db/btree/AbstractBtreeKey";
import { BtreeStorage } from "../../../db/btree/BtreeStorage";
import { DataNode } from "../../../db/btree/DataNode";
import { IBlockObject } from "../../../db/filestore_block/IBlockObject";

export class TempValue implements IBlockObject {
    private value : number;

    constructor(value : number){
        this.value = value;
    }

    public binarySize(): number {
        return 4 + 8;
    }
    public toBinary(out: ByteBuffer): void {
        out.putInt(TmpValueFactory.TMPVALUE);
        out.putLong(this.value);
    }
    public copyData(): IBlockObject {
        return new TempValue(this.value);
    }

    public getValue(){
        return this.value;
    }
}

export class TmpValueFactory extends AbstractBtreeDataFactory {
    public static readonly TMPVALUE : number = 100;

    public makeDataFromBinary(input: ByteBuffer): IBlockObject {
        let type = input.getInt();

        let value = Number(input.getLong());
        return new TempValue(value);
    }
    
    public copy(): AbstractBtreeDataFactory {
        return new TmpValueFactory();
    }
}
