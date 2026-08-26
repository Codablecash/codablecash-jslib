import { ArrayList } from "../../db/base/ArrayList";
import { NullPointerException } from "../../db/base/NullPointerException";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";

export abstract class AbstractMerkleElement {
	protected hash : ByteBuffer | null;
	protected parent : AbstractMerkleElement | null;
	protected children : ArrayList<AbstractMerkleElement>;

    constructor(){
        this.hash = null;
        this.parent = null;
        this.children = new ArrayList<AbstractMerkleElement>();
    }

    public abstract find(hash : ByteBuffer) : AbstractMerkleElement | null;

	public getHash() : ByteBuffer {
        if(this.hash){
            return this.hash;
        }
		throw new NullPointerException("AbstractMerkleElement.getHash()");
	}
	public getParent() : AbstractMerkleElement {
        if(this.parent != null){
            return this.parent;
        }
		throw new NullPointerException("AbstractMerkleElement.getParent()");
	}
	public setParent(parent : AbstractMerkleElement) : void {
		this.parent = parent;
	}

    public setHash(b : ByteBuffer) : void {
        this.hash = b.clone()
    }

    public addChild(child : AbstractMerkleElement) : void {
        child.setParent(this);
        this.children.addElement(child);
    }

    public hashSize() : number {
        return this.hash != null ? this.hash.limit() : 0;
    }

    public isLeaf() : boolean {
        return this.children.isEmpty();
    }

    public isRoot() : boolean {
        return this.parent == null;
    }

    public getAnotherPair() : AbstractMerkleElement {
        if(this.parent != null){
            let idx = this.isLeft() ? 1 : 0;

            let element = this.parent.children.get(idx);
            if(element != null){ // guard
                 return element;
            }
        }
        throw new NullPointerException("AbstractMerkleElement.getAnotherPair()");
    }

    public isLeft() : boolean {
        if(this.parent != null){
            let leftElement = this.parent.children.get(0);

            return this == leftElement;
        }
        throw new NullPointerException("AbstractMerkleElement.getAnotherPair()");
    }
}