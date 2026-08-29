import { BlockBody } from "../bc_block_body/BlockBody";
import { BlockHeader } from "./BlockHeader";

export class Block {
    private header : BlockHeader;
	private body : BlockBody;

    constructor(arg0 : number | BlockHeader, arg1 : number | BlockBody ){
        if(arg0 instanceof BlockHeader && arg1 instanceof BlockBody){
            this.header = <BlockHeader>(arg0.copyData());
            this.body = <BlockBody>(arg1.copyData());
            return;
        }
        else if(typeof arg0 == "number" && typeof arg1 == "number"){
            this.header = new BlockHeader();
            this.body = new BlockBody();

            this.header.setZone(arg0);
            this.header.setHeight(arg1);
            return;
        }

        throw new Error("Wrong argument/ Block.constructor()");
    }
}