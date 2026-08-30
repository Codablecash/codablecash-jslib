
export class CodablecashSystemParam {
    private voteBeforeNBlocks : number;
    private voteBlockIncludeAfterNBlocks : number;

    constructor(){
        this.voteBeforeNBlocks = 1;
        this.voteBlockIncludeAfterNBlocks = 1;
    }

    public getVoteBeforeNBlocks(height : number) {
	    return this.voteBeforeNBlocks;
    }

    public getVoteBlockIncludeAfterNBlocks(height : number) {
	    return this.voteBlockIncludeAfterNBlocks;
    }
}