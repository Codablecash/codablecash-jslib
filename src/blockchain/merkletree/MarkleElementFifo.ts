import { ArrayList } from "../../db/base/ArrayList";
import { NullPointerException } from "../../db/base/NullPointerException";
import { AbstractMerkleElement } from "./AbstractMerkleElement";

export class MarkleElementFifo {
    private list : ArrayList<AbstractMerkleElement>;

    constructor(){
        this.list = new ArrayList<AbstractMerkleElement>();
    }

    public addElement(element : AbstractMerkleElement) : void {
        this.list.addElement(element);
    }

    public out() : AbstractMerkleElement {
        let ret = this.list.remove(0);
        if(ret != null){
            return ret;
        }
        throw new NullPointerException("MarkleElementFifo.out()");
    }

    public size() : number {
        return this.list.size();
    }

    public isEmpty() : boolean {
        return this.size() == 0;
    }
}