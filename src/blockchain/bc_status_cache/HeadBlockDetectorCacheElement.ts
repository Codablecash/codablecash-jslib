import { ArrayList } from "../../db/base/ArrayList";
import { TransactionId } from "../bc_trx/TransactionId";
import { BlockHeadElement } from "./BlockHeadElement";


export class HeadBlockDetectorCacheElement {
	private voterScore : number;
	private votingScore : number;
	private mevHealthScore : number;

    constructor(){
        this.mevHealthScore = 0;
        this.voterScore = 0;
        this.votingScore = 0;
    }

    public importBlockHeadElement(element : BlockHeadElement) {
        this.mevHealthScore = element.getMevHealthScore();
        this.voterScore = element.getVotedScore();
        this.votingScore = element.getVotingSocre();
    }

    public export2BlockHeadElement(element : BlockHeadElement) : void {
        element.setVotedScore(this.voterScore);
        element.setVotingScore(this.votingScore);
        element.setMevHealthScore(this.mevHealthScore);
    }
}