import { ArrayList } from "../../db/base/ArrayList";
import { NullPointerException } from "../../db/base/NullPointerException";
import { ISystemLogger } from "../bc/ISystemLogger";
import { BlockHeaderId } from "../bc_block/BlockHeaderId";
import { BlockHeaderStoreManager } from "../bc_blockstore_header/BlockHeaderStoreManager";
import { BlockHead } from "./BlockHead";
import { HeadBlockDetectorCache } from "./HeadBlockDetectorCache";
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

        BlockStack stack;
        // first root
        {
            ArrayList<BlockHeader>* headerList = headerStore.getBlocksAtHeight(startHeight); __STP(headerList);
            headerList.setDeleteOnExit();

            BlockStackElement* element = new BlockStackElement();
            int maxLoop = headerList.size();
            for(int i = 0; i != maxLoop; ++i){
                const BlockHeader* header = headerList.get(i);
                const BlockHeaderId* headerId = header.getId();


                // filter finalized root
                if(header.getHeight() == 1 || finalizedTopHeaderId.equals(headerId)){
                    element.addHeader(header);
                }
            }
            stack.push(element);
        }

        // children
        while(!stack.isEmpty()){
            BlockStackElement* element = stack.top();
            const BlockHeader* header = element.current();
            const BlockHeaderId* headerId = header.getId();
            uint64_t height = header.getHeight();

            // getChildrenOf() does not return nullptr
            ArrayList<BlockHeader>* children = headerStore.getChildrenOf(headerId, height); __STP(children);
            children.setDeleteOnExit();

            // add generated block
            if(this.scheduledBlock != nullptr){
                addScheculedBlock(height, headerId, children);
            }

            if(children.isEmpty()){ // head
                BlockHead* head = stack.createBlockHead();
                this.headsList.addElement(head);

                stack.gotoBranch();
            }
            else{ // add children
                BlockStackElement* element = new BlockStackElement();

                int maxLoop = children.size();
                for(int i = 0; i != maxLoop; ++i){
                    const BlockHeader* header = children.get(i);
                    element.addHeader(header);
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


    // TODO implement
}