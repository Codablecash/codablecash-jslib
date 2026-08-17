import { AbstractBtreeKey } from "./AbstractBtreeKey";

export abstract class AbstractTreeNode {
    private key : AbstractBtreeKey;
    private fpos : number;

    constructor(key : AbstractBtreeKey) {
        this.key = key;
        this.fpos = 0;      
    }


    public abstract isData() : boolean;
    public getKey() : AbstractBtreeKey {
        return this.key;
    }
    public setKey(key : AbstractBtreeKey) : void {
        this.key = key.clone();
    }

    public getFpos() : number {
        return this.fpos;
    }
    public setFpos(fpos : number) : void {
        this.fpos = fpos;
    }

}
