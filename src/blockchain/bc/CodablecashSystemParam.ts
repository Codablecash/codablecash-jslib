
export class CodablecashSystemParam {
    private voteBeforeNBlocks : number;
    private voteBlockIncludeAfterNBlocks : number;

    private votePerBlock : number;

    constructor(){
        this.voteBeforeNBlocks = 1;
        this.voteBlockIncludeAfterNBlocks = 1;

        this.votePerBlock = 5;
    }

    public getVoteBeforeNBlocks(height : number) {
	    return this.voteBeforeNBlocks;
    }

    public getVoteBlockIncludeAfterNBlocks(height : number) {
	    return this.voteBlockIncludeAfterNBlocks;
    }

    public getVotePerBlock() : number {
		return this.votePerBlock;
	}
}