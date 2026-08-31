import { CFile } from "../../db/base_io/CFile";
import { CodablecashSystemParam } from "../bc/CodablecashSystemParam";
import { ISystemLogger } from "../bc/ISystemLogger";
import { StatusStore } from "../bc_base_conf_store/StatusStore";
import { BlockHeaderStoreManager } from "../bc_blockstore_header/BlockHeaderStoreManager";
import { HeadBlockDetector } from "../bc_status_cache/HeadBlockDetector";
import { HdWallet } from "../bc_wallet/HdWallet";
import { ManagementAccountsCollection } from "../bc_wallet_net_data_management/ManagementAccountsCollection";
import { TransactionGroupDataStore } from "./TransactionGroupDataStore";
import { WalletMemoryPool } from "./WalletMemoryPool";

export class NetworkWalletData {
	private baseDir : CFile;
	private logger : ISystemLogger;
	private config : CodablecashSystemParam;

	// wallet (Finalized Data)
	private hdWallet : HdWallet | null;
	private finalizedHeight : number;
	private zone : number;

	// unfinalized chain
	private transactionGroupData : TransactionGroupDataStore;
	private headerManager : BlockHeaderStoreManager | null;
	private detector : HeadBlockDetector;

	// memory pool
	private mempool : WalletMemoryPool;

	// store
	private statusStore : StatusStore | null;

	// management account
	private managementAccounts : ManagementAccountsCollection;


	constructor(baseDir : CFile, logger : ISystemLogger, config : CodablecashSystemParam){
		this.baseDir = baseDir;
		this.logger = logger;
		this.config = config;

		this.hdWallet = null;
		this.headerManager = null;
		this.detector = new HeadBlockDetector(this.logger);;

		this.transactionGroupData = new TransactionGroupDataStore(this.baseDir);

		let mempoolBaseDir = this.baseDir.get("mempool");
		this.mempool = new WalletMemoryPool(mempoolBaseDir);

		this.finalizedHeight = 0;
		this.zone = 0;
		this.statusStore = null;

		this.managementAccounts = new ManagementAccountsCollection();
	}
    // TODO implement
}