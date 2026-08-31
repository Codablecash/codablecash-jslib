import { ArrayList } from "../../db/base/ArrayList";
import { NullPointerException } from "../../db/base/NullPointerException";
import { BlockHead } from "./BlockHead";
import { BlockStackElement } from "./BlockStackElement";


export class BlockStack {
    private list : ArrayList<BlockStackElement>;

    constructor(){
        this.list = new ArrayList<BlockStackElement>();
    }

    public push(element : BlockStackElement) : void {
        this.list.addElement(element);
    }

    public top() : BlockStackElement {
        let pos = this.list.size() - 1;

        let ret = this.list.get(pos);
        if(ret != null){
            return ret;
        }
        throw new NullPointerException("BlockStack.top()");
    }

    public isEmpty() : boolean {
        return this.list.isEmpty();
    }

    public createBlockHead() : BlockHead {
        let head = new BlockHead();

        let maxLoop = this.list.size();
        for(let i = 0; i != maxLoop; ++i){
            let element = this.list.get(i);

            if(element != null){ // guard
                let header = element.current();
                head.addHeader(header);
            }
        }

        return head;
    }

    public gotoBranch() : void {
        let element = this.top();
        while(!element.hasNext()){
            this.list.pop();
            if(this.isEmpty()){
                break;
            }
            element = this.top();
        }

        if(!this.isEmpty()){
            element = this.top();

            //assert(element.hasNext());

            element.next();
        }
    }
}