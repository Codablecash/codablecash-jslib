import { ArrayList } from "../../db/base/ArrayList";
import { IComparable } from "../../db/base/IComparable";
import { NullPointerException } from "../../db/base/NullPointerException";
import { BlockHeader } from "../bc_block/BlockHeader";

export class BlockStackElement implements IComparable{
    private pos : number;
	private list : ArrayList<BlockHeader>;

    constructor(){
        this.pos = 0;
        this.list = new ArrayList<BlockHeader>();
    }
    
    compareTo(other: IComparable | null): number {
        throw new Error("Method not implemented.");
    }

    public addHeader(header : BlockHeader) : void {
        this.list.addElement(<BlockHeader>(header.copyData()));
    }

    public current() : BlockHeader {
        let h = this.list.get(this.pos);
        if(h != null){
            return h;
        }
        throw new NullPointerException("BlockStackElement.current()");
    }

    public hasNext() : boolean {
        let maxIndex = this.list.size() - 1;
        return maxIndex > this.pos;
    }

    public next() : void {
        this.pos++;
    }
}