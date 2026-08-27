import { RawArrayPrimitive } from "../../db/base/RawArrayPrimitive";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";

export class BlockHeaderList implements IBlockObject {
    private list : RawArrayPrimitive<number>; // list of fpos

    constructor(){
        this.list = new RawArrayPrimitive<number>();
    }

    public binarySize() : number {
        let total = 4; //sizeof(uint32_t);
        total += 8 * this.list.size();

        return total;
    }

    public toBinary(out : ByteBuffer) : void {
        let maxLoop = this.list.size();
        out.putInt(maxLoop);

        for(let i = 0; i != maxLoop; ++i){
            let fpos = this.list.get(i);
            out.putLong(fpos);
        }
    }

    public static fromBinary(input : ByteBuffer) : BlockHeaderList {
        let value = new BlockHeaderList();

        let maxLoop = input.getInt();
        for(let i = 0; i != maxLoop; ++i){
            let fpos = input.getLong();
            value.list.addElement(Number(fpos));
        }

        return value;
    }

    public copyData() : IBlockObject {
        let inst =  new BlockHeaderList();

        let maxLoop = this.list.size();
        for(let i = 0; i != maxLoop; ++i){
            let fpos = this.list.get(i);
            inst.list.addElement(fpos);
        }

        return inst;
    }

    public join(value : BlockHeaderList) :void {
        let newList = value.list;

        let maxLoop = newList.size();
        for(let i = 0; i != maxLoop; ++i){
            let v = newList.get(i);
            if(this.contains(v)){
                continue;
            }
            this.list.addElement(v);
        }
    }

    public contains(value : number) : boolean {
        let maxLoop = this.list.size();
        for(let i = 0; i != maxLoop; ++i){
            let v = this.list.get(i);
            if(v == value){
                return true;
            }
        }

        return false;
    }

    public remove(value : number) : void {
        let index = this.indexof(value);

        if(index >= 0){
            this.list.remove(index);
        }
    }

    public indexof(value : number) : number {
        let maxLoop = this.list.size();
        for(let i = 0; i != maxLoop; ++i){
            let v = this.list.get(i);
            if(v == value){
                return i;
            }
        }

        return -1;
    }

    public isEmpty() : boolean {
        return this.list.size() == 0;
    }

    public add(value : number) : void {
        this.list.addElement(value);
    }

    public size() : number {
        return this.list.size();
    }

    public get(pos : number) : number {
        return this.list.get(pos);
    }
}