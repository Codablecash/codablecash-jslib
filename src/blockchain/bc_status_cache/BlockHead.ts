import { ArrayList } from "../../db/base/ArrayList";
import { IComparable } from "../../db/base/IComparable";
import { NullPointerException } from "../../db/base/NullPointerException";
import { BlockHeader } from "../bc_block/BlockHeader";
import { BlockHeadElement } from "./BlockHeadElement";
import { BlockHeadElementPadding } from "./BlockHeadElementPadding";

export class BlockHead implements IComparable{
    private list : ArrayList<BlockHeadElement>;

    constructor(){
        this.list = new ArrayList<BlockHeadElement>();
    }

	public size() : number {
		return this.list.size();
	}

	public getHeaders() : ArrayList<BlockHeadElement> {
		return this.list;
	}

    public copyOriginalBlockHead() : BlockHead {
        let newHead = new BlockHead();

        let maxLoop = this.list.size();
        for(let i = 0; i != maxLoop; ++i){
            let h = this.list.get(i);

            if(h != null && h.isPaddong()){
                break;
            }

            if(h != null){ // guard
                newHead.addElement(h);
            }
        }

        return newHead;
    }

    public normalizeWithlength(length : number) : void {
        let maxLoop = this.list.size();

        let paddingSize = length - maxLoop;
        for(let i = 0; i != paddingSize; ++i){
            let pad = new BlockHeadElementPadding();

            this.list.addElement(pad);
        }
    }

    public addHeader(header : BlockHeader) : void {
        let element = new BlockHeadElement(header);

        this.list.addElement(element);
    }

    public addElement(newElement : BlockHeadElement) : void {
         this.list.addElement(newElement.clone());
    }

    public getHeadHeader() : BlockHeader {
        let head = this.getTopBlockHeadElement(0);
        //assert(head != nullptr);

        return head.getBlockHeader();
    }

    public getRealHeadHeader() : BlockHeader {
        let header = this.getHeadHeader();

        //if(header.isScheduledBlock()){
        //    let head = this.getTopBlockHeadElement(1);
        //    header = head.getBlockHeader();
        //}
        //assert(header != nullptr);

        return header;
    }

    public getHeadHeight() : number {
        let h = this.getHeadHeader();
        return h.getHeight();
    }

    public compareTo(otherCl : IComparable) : number {
        let other = <BlockHead>otherCl;

        let otherMaxLoop = other.size();
        let maxLoop = this.size();

        //assert(otherMaxLoop == maxLoop);

        // compare by Vote . VTP . Mev . length . timestamp
        let diff = 0;

        // check by voted score
        diff = this.compareToByVoted(other);
        if(diff != 0){
            return diff;
        }

        // check by voting
        diff = this.compareToByVoting(other);
        if(diff != 0){
            return diff;
        }

        // check by total mev score
        diff = this.compareToByTotalMevScore(other);
        if(diff != 0){
            return diff;
        }

        // check by length
        diff = this.compareToByLastHeight(other);
        if(diff != 0){
            return diff;
        }

        // check by last timestamp
        return this.compareToByLastTimestamp(other);
    }

    public compareToByVoted(other : BlockHead) : number {
        let diff = 0;

        let maxLoop = this.size();
        for(let i = 0; i != maxLoop; ++i){
            let block = this.list.get(i);
            let otherBlock = other.list.get(i);

            if(block != null && otherBlock != null){
                let v = block.getVotedScore();
                let vo = otherBlock.getVotingSocre();

                diff = v - vo;
                if(diff != 0){
                    break;
                }
            }
        }

        return diff;
    }

    public compareToByVoting(other : BlockHead) : number {
        let diff = 0;

        let maxLoop = this.size();
        for(let i = 0; i != maxLoop; ++i){
            let block = this.list.get(i);
            let otherBlock = other.list.get(i);

            if(block != null && otherBlock != null){
                let v = block.getVotingSocre();
                let vo = otherBlock.getVotingSocre();

                diff = v - vo;
                if(diff != 0){
                    break;
                }
            }
        }

        return diff;
    }

    public compareToByTotalMevScore(other : BlockHead) : number {
        let v  = 0;
        let vo  = 0;

        let maxLoop = this.size();
        for(let i = 0; i != maxLoop; ++i){
            let block = this.list.get(i);
            let otherBlock = other.list.get(i);

            if(block != null && otherBlock != null){
                v += block.getMevHealthScore();
                vo += otherBlock.getMevHealthScore();
            }
        }

        return v - vo;
    }

    public compareToByLastHeight(other : BlockHead) : number {
        let header = this.getHeadHeader();
        let height = header.getHeight();

        let otherHeader = other.getHeadHeader();
        let otherHeight = otherHeader.getHeight();

        return height > otherHeight ? 1 : (height < otherHeight ? -1 : 0);
    }

    public compareToByLastTimestamp(other : BlockHead) : number {
        let header = this.getHeadHeader();
        let tm = header.getTimestamp();

        let otherHeader = other.getHeadHeader();
        let othertm = otherHeader.getTimestamp();

        return tm.compareTo(othertm);
    }

    public getTopBlockHeadElement(posFromTop : number) : BlockHeadElement {
        let count = 0;

        let maxLoop = this.size();
        for(let i = 0; i != maxLoop; ++i){
            let block = this.list.get(i);

            if(block != null && block.isPaddong()){
                break;
            }
            count = i;
        }

        let ret =  this.list.get(count - posFromTop);
        if(ret != null){
            return ret;
        }

        throw new NullPointerException("BlockHead.getTopBlockHeadElement()");
    }

    public getHeadBlockHead() : BlockHeadElement {
        let pos = this.list.size() - 1;

        let el = this.list.get(pos);
        if(el != null){
            return el;
        }
        throw new NullPointerException("BlockHead.getHeadBlockHead()");
    }
}