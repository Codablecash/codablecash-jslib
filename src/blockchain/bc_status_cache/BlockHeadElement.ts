import { isColonToken } from "typescript";
import { BlockHeader } from "../bc_block/BlockHeader";
import { BlockHeaderId } from "../bc_block/BlockHeaderId";
import { VotePart } from "../bc_block_vote/VotePart";
import { IComparable } from "../../db/base/IComparable";


export class BlockHeadElement implements IComparable {
	private header : BlockHeader;

	private votedScore;
	private votingScore;
	private mevHealthScore;

    constructor(header : BlockHeader) {
        this.header = <BlockHeader>(header.copyData());

        this.votingScore = 0;
        this.votedScore = 0;
        this.mevHealthScore = 0;
    }

	public getVotedScore() : number {
		return this.votedScore;
	}
	public setVotedScore(score : number) : void {
		this.votedScore = score;
	}

	public getVotingSocre() : number  {
		return this.votingScore;
	}
	public setVotingScore(votingScore : number) : void {
		this.votingScore = votingScore;
	}

	public getMevHealthScore() : number  {
		return this.mevHealthScore;
	}
	public setMevHealthScore(score : number) : void {
		this.mevHealthScore = score;
	}

    public clone() : BlockHeadElement {
        let inst = new BlockHeadElement(this.header);

        inst.votingScore = this.votedScore;
        inst.votedScore = this.votedScore;
        inst.mevHealthScore = this.mevHealthScore;

        return inst;
    }

    public compareTo(other: IComparable | null): number {
        let o = <BlockHeadElement>other;
        if(o == null){
            return 1;
        }

        return this.header.getHeight() - o.header.getHeight();
    }

	public isPaddong() : boolean {
		return false;
	}

    public getBlockHeader() : BlockHeader {
		return this.header;
	}

    public importVotes(votes : VotePart) {
        let id = this.header.getId();
        let idstr = id.toString();

        let map = votes.getMap();
        for(const headerIDStr of map.keys()){
            if(headerIDStr === idstr){
                let group = map.get(headerIDStr);

                if(group != undefined){
                    this.votedScore += group.size();
                }
            }
        }
    }

    public toString() : string {
        let id = this.header.getId().toString();
        let height = this.header.getHeight();

        let message = id;
        message += " [";

        message += "height: "; message += height;
        message += " voted: "; message += this.votedScore;
        message += " voting: "; message += this.votingScore;
        message += " mev: "; message += this.mevHealthScore;

        message += "]";

        return message;
    }

    public calcVotingScore(votedId : BlockHeaderId) {
        let votePart = this.header.getVotePart();

        let group = votePart.getVotedGroup(votedId);
        if(group != null){
            this.votingScore = group.size();
        }
    }
}