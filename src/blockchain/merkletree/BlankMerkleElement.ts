import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { Base58 } from "../bc_base/Base58";
import { AbstractMerkleElement } from "./AbstractMerkleElement";

export class BlankMerkleElement extends AbstractMerkleElement {
    public static BLANK_HASH = "GKot5hBsd81kMupNCXHaqbhv3huEbxAFMLnpcX2hniwn";

    constructor() {
        super();
        this.hash = Base58.decode(BlankMerkleElement.BLANK_HASH);
    }

    public find(hash : ByteBuffer) : AbstractMerkleElement | null {
	    return null;
   }
}