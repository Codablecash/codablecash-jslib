import { BlockHeader } from "../bc_block/BlockHeader";
import { BlockHeaderId } from "../bc_block/BlockHeaderId";
import { VotePart } from "../bc_block_vote/VotePart";


export class BlockHeadElement {
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