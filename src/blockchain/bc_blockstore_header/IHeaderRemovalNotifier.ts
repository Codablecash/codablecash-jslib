import { BlockHeader } from "../bc_block/BlockHeader";

export interface IHeaderRemovalNotifier {
    onRemovedHeader(header : BlockHeader) : void;
}