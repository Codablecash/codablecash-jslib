import { BlockHeaderStoreManager } from "../bc_blockstore_header/BlockHeaderStoreManager";

export interface IBlockchainStoreProvider {
	getHeaderManager(zone : number) : BlockHeaderStoreManager;
}