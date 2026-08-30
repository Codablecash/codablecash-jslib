import { ArrayList } from "../../db/base/ArrayList";
import { NullPointerException } from "../../db/base/NullPointerException";
import { CodablecashSystemParam } from "../bc/CodablecashSystemParam";
import { ISystemLogger } from "../bc/ISystemLogger";
import { BlockHeader } from "../bc_block/BlockHeader";
import { BlockHeaderId } from "../bc_block/BlockHeaderId";
import { VotePart } from "../bc_block_vote/VotePart";
import { BlockHeaderStoreManager } from "../bc_blockstore_header/BlockHeaderStoreManager";
import { BlockHead } from "./BlockHead";
import { BlockHeadElement } from "./BlockHeadElement";
import { BlockStack } from "./BlockStack";
import { BlockStackElement } from "./BlockStackElement";
import { HeadBlockDetectorCache } from "./HeadBlockDetectorCache";
import { HeadBlockDetectorCacheElement } from "./HeadBlockDetectorCacheElement";
import { IBlockchainStoreProvider } from "./IBlockchainStoreProvider";


export class HeadBlockDetector {
	private headsList : ArrayList<BlockHead>;
	private cache : HeadBlockDetectorCache;

	private selectedHead : BlockHead | null;
	private secondHead : BlockHead | null;

	private logger : ISystemLogger;

	// Block* scheduledBlock;

    constructor(logger : ISystemLogger){
        this.logger = logger;

        this.headsList = new ArrayList<BlockHead>();
        this.cache = new HeadBlockDetectorCache();
        this.selectedHead = null;
        this.secondHead = null;
    }

    public reset() : void {
        this.headsList.reset();

        this.selectedHead = null;
        this.secondHead = null;

        this.cache.reset();
    }

    public buildHeads(zone : number, chain : IBlockchainStoreProvider, finalizedHeight : number) : void {
        let headerStore = chain.getHeaderManager(zone);

        let startHeight = finalizedHeight > 0 ? finalizedHeight : 1;
        let finalizedTopHeaderId = this.getFinalizedHeaderId(headerStore, startHeight);

        let stack  = new BlockStack();
        // first root
        {
            let headerList = headerStore.getBlocksAtHeight(startHeight);

            if(headerList != null && finalizedTopHeaderId != null){
                let element = new BlockStackElement();
                let maxLoop = headerList.size();
                for(let i = 0; i != maxLoop; ++i){
                    let header = headerList.get(i);

                    if(header != null){
                        let headerId = header.getId();

                        // filter finalized root
                        if(header.getHeight() == 1 || finalizedTopHeaderId.equals(headerId)){
                            element.addHeader(header);
                        }
                    }
                }
                stack.push(element);
            }
            else {
                throw new NullPointerException("HeadBlockDetector.buildHeads() 1");
            }

        }

        // children
        while(!stack.isEmpty()){
            let element = stack.top();
            let header = element.current();
            let headerId = header.getId();
            let height = header.getHeight();

            // getChildrenOf() does not return nullptr
            let children = headerStore.getChildrenOf(headerId, height);

            // add generated block ** ignore
            //if(this.scheduledBlock != nullptr){
            //   addScheculedBlock(height, headerId, children);
            //

            if(children.isEmpty()){ // head
                let head = stack.createBlockHead();
                this.headsList.addElement(head);

                stack.gotoBranch();
            }
            else{ // add children
                let element = new BlockStackElement();

                let maxLoop = children.size();
                for(let i = 0; i != maxLoop; ++i){
                    let header = children.get(i);

                    if(header != null){
                        element.addHeader(header);
                    }
                }

                stack.push(element);
            }
        }

        // normalize
        this.normalizeHeadLength();
    }

    private getFinalizedHeaderId(headerStore : BlockHeaderStoreManager, finalizedHeight : number) : BlockHeaderId | null{
        if(finalizedHeight == 0){
            return null;
        }
        let list = headerStore.getBlocksAtHeight(finalizedHeight);
        if(list != null){
            let header = list.get(0);
            if(header != null){
                return <BlockHeaderId>header.getId().copyData();
            }
        }

        throw new NullPointerException("HeadBlockDetector.getFinalizedHeaderId()");
    }

    public normalizeHeadLength() : void {
        let length = 0;

        {
            let maxLoop = this.headsList.size();
            for(let i = 0; i != maxLoop; ++i){
                let head = this.headsList.get(i);

                if(head != null){
                    let size = head.size();

                    if(size > length){
                        length = size;
                    }
                }
            }
        }

        {
            let maxLoop = this.headsList.size();
            for(let i = 0; i != maxLoop; ++i){
                let head = this.headsList.get(i);

                if(head != null){
                    head.normalizeWithlength(length);
                }
            }
        }
    }

    public evaluate(zone : number, chain : IBlockchainStoreProvider, config : CodablecashSystemParam) : void {

        let maxLoop = this.headsList.size();
        for(let i = 0; i != maxLoop; ++i){
            let head = this.headsList.get(i);

            if(head != null){
                this.evaluateHead(zone, head, chain, config);
            }
        }
    }

    public evaluateHead(zone : number, head : BlockHead, chain : IBlockchainStoreProvider, config : CodablecashSystemParam) {
        let list = head.getHeaders();
        let maxLoop = list.size();
        for(let i = 0; i != maxLoop; ++i){
            let element = list.get(i);
            if(element != null && element.isPaddong()){
                break;
            }

            if(element != null){ // guard
                let header = element.getBlockHeader();
                let headerId = header.getId();
                let height = header.getHeight();

                // use cache
                {
                    let cacheElement = this.cache.getCache(headerId);
                    if(cacheElement != null){
                        cacheElement.export2BlockHeadElement(element);
                        continue;
                    }
                }

                let cacheElemet = new HeadBlockDetectorCacheElement();
                // vote
                this.handleVotes(config, chain, list, header, i);

                // register cache
                cacheElemet.importBlockHeadElement(element);
                this.cache.registerCache(headerId, cacheElemet);
            }
        }
    }

    private handleVotes(config : CodablecashSystemParam, chain : IBlockchainStoreProvider, list : ArrayList<BlockHeadElement>, header : BlockHeader, i : number) : void{
        let height = header.getHeight();

        let voteBeforeNBlocks = config.getVoteBeforeNBlocks(height);
        let voteBlockIncludeAfterNBlocks = config.getVoteBlockIncludeAfterNBlocks(height);
        let diffBlocks = voteBeforeNBlocks + voteBlockIncludeAfterNBlocks;

        let pos = i - diffBlocks;
        if(pos >= 0){
            // calc voted score of voted block
            let vorts = header.getVotePart();
            let element = list.get(pos); // voted block

            if(element != null){ // guard
                element.importVotes(vorts);

                // voting
                let votedHeader = element.getBlockHeader();
                let votedId = votedHeader.getId();
                let votingElement = list.get(i); // self block

                if(votingElement != null){ // guard
                    votingElement.calcVotingScore(votedId);
                    return;
                }
            }

        }


        // can not voted score of voted block
        // calc only voting of this block
        if(height > diffBlocks){
            let votedHeight = height - diffBlocks;

            let zone = header.getZone();
            let headerManager = chain.getHeaderManager(zone);

            let votingHeaderId = header.getId();
            let votedHeader = headerManager.getNBlocksBefore(votingHeaderId, height, diffBlocks);

            if(votedHeader != null){ // guard
                let votedId = votedHeader.getId();

                let votingElement = list.get(i); // self block
                if(votingElement != null){ // guard
                    votingElement.calcVotingScore(votedId);
                }
            }

        }
    }

    // TODO implement
}