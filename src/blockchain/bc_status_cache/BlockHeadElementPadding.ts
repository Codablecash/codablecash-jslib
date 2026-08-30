import { BlockHeader } from "../bc_block/BlockHeader";
import { BlockHeadElement } from "./BlockHeadElement";


export class BlockHeadElementPadding extends BlockHeadElement {
	constructor(){
		super(new BlockHeader());
	}

	public isPaddong() : boolean {
		return true;
	}

	public clone() : BlockHeadElement {
		return new BlockHeadElementPadding();
	}
}