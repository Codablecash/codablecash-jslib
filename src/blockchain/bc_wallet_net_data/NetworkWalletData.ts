import { TransactionTransferData } from "../../blockchain_p2p/data_history_data/TransactionTransferData";
import { ArrayList } from "../../db/base/ArrayList";
import { NullPointerException } from "../../db/base/NullPointerException";
import { CFile } from "../../db/base_io/CFile";
import { CodablecashSystemParam } from "../bc/CodablecashSystemParam";
import { ISystemLogger } from "../bc/ISystemLogger";
import { StatusStore } from "../bc_base_conf_store/StatusStore";
import { BlockHeader } from "../bc_block/BlockHeader";
import { BlockHeaderId } from "../bc_block/BlockHeaderId";
import { CodablecashBlockchain } from "../bc_blockstore/CodablecashBlockchain";
import { BlockHeaderStoreManager } from "../bc_blockstore_header/BlockHeaderStoreManager";
import { HeadBlockDetector } from "../bc_status_cache/HeadBlockDetector";
import { AbstractBlockchainTransaction } from "../bc_trx/AbstractBlockchainTransaction";
import { TransactionId } from "../bc_trx/TransactionId";
import { HdWallet } from "../bc_wallet/HdWallet";
import { HdWalletSeed } from "../bc_wallet/HdWalletSeed";
import { WalletAccount } from "../bc_wallet/WalletAccount";
import { IWalletDataEncoder } from "../bc_wallet_encoder/IWalletDataEncoder";
import { ManagementAccount } from "../bc_wallet_net_data_management/ManagementAccount";
import { ManagementAccountsCollection } from "../bc_wallet_net_data_management/ManagementAccountsCollection";
import { HeaderTransactionGroup } from "./HeaderTransactionGroup";
import { TransactionGroupDataStore } from "./TransactionGroupDataStore";
import { WalletMemoryPool } from "./WalletMemoryPool";

export class NetworkWalletData {
	public static KEY_ZONE = "zone";
	public static KEY_FINALIZED_HEIGHT = "finalizedHeight";
	public static STATUS_STORE_FILE_NAME = "status.bin";


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

	public openHdWallet(encoder : IWalletDataEncoder) : void {
		this.__initStatusStore();
		this.__loadStatus();

		let hdbase = this.baseDir.get("hd");
		this.hdWallet = HdWallet.loadWallet(hdbase, encoder);
	}

	public openData() : void {
		this.headerManager = new BlockHeaderStoreManager(this.baseDir, CodablecashBlockchain.DEFAULT_SECTION_LIMIT);

		this.transactionGroupData.open();
		this.mempool.open();

		this.__initStatusStore();
		this.__loadStatus();
	}

	public close() : void {
		if(this.transactionGroupData != null){
			this.transactionGroupData.close();
		}

		if(this.mempool != null){
			this.mempool.close();
		}

		if(this.statusStore != null){
			this.statusStore.close();
			this.statusStore = null;
		}

		if(this.hdWallet != null){
			this.hdWallet.close();
			this.hdWallet = null;
		}
	}

	public createHdWallet(seed : HdWalletSeed, defaultZone : number, encoder : IWalletDataEncoder, defaultMaxAddress : number) {
		let hdbase = this.baseDir.get("hd");

		this.hdWallet = HdWallet.create(hdbase, seed, defaultZone, encoder, defaultMaxAddress);

		this.zone = defaultZone;

		this.__initStatusStore();
		this.__saveStatus();
	}

	public createBlankData() : void {
		this.headerManager = new BlockHeaderStoreManager(this.baseDir, CodablecashBlockchain.DEFAULT_SECTION_LIMIT);

		this.transactionGroupData.initBlank();
		this.transactionGroupData.open();

		this.mempool.createBlankPool();
		this.mempool.open();

		this.__initStatusStore();
		this.__saveStatus();
	}

	public addTransactionDataToMempool(data : TransactionTransferData) {
		let trx = data.getTransaction();
		this.__addTransactionDataToMempool(trx);
	}

	public __addTransactionDataToMempool(trx : AbstractBlockchainTransaction) : void {
		let trxId = trx.getTransactionId();

		if(!this.mempool.hasTransaction(trxId)){
			this.mempool.putTransaction(trx);

			this.managementAccounts.resetMempool();
			this.__buildMempoolAccount();
		}
	}

	public getTransactionStoreStatus(trxId : TransactionId) : number {
		return this.managementAccounts.getTransactionStoreStatus(trxId);
	}

	public getDefaultZone() : number {
		if(this.hdWallet != null){
			return this.hdWallet.getDefaultZone();
		}
		throw new NullPointerException("NetworkWalletData.getDefaultZone()");
	}

	public addHeader(header : BlockHeader, trxlist : ArrayList<AbstractBlockchainTransaction>) : void {
		// add header if has header
		if(this.headerManager != null){
			let headerId = header.getId();
			let height = header.getHeight();

			let h = this.headerManager.getHeader(headerId, height);
			if(h == null){
				this.headerManager.addHeader(header);
			}
		}

		// trx group
		{
			let group = new HeaderTransactionGroup();
			let id = header.getId();
			group.setHeaderId(id);

			let maxLoop = trxlist.size();
			for(let i = 0; i != maxLoop; ++i){
				let trx = trxlist.get(i);

				if(trx != null){
					group.addTransaction(trx);
				}
			}

			this.transactionGroupData.add(id, group);
		}
	}

	public checkAndFinalizing() : boolean {
		let finalized = false;

		let votePerBlock : number = this.config.getVotePerBlock();
		let list = new ArrayList<BlockHeader>();

		// make list
		{
			let head = this.detector.getHead();
			let elements = head.getHeaders();

			let maxLoop = elements.size();
			for(let i = 0; i != maxLoop; ++i){
				let ele = elements.get(i);

				if(ele != null){ // guard
					let header = ele.getBlockHeader();
					let height = header.getHeight();

					if(height > this.finalizedHeight){
						list.addElement(header);
					}
				}
			}
		}

		// handle the list
		{
			let maxLoop = list.size();
			for(let i = 0; i != maxLoop; ++i){
				let header = list.get(i);

				if(header != null && header.isFinalizing(votePerBlock)){
					this.__doFinalize(header);
					finalized = true;
				}
			}
		}

		return finalized;
	}

	public __doFinalize(header : BlockHeader) : void {
		let includingHeight = header.getHeight();
		let id = header.getId();

		let voteBeforeNBlocks = this.config.getVoteBeforeNBlocks(includingHeight);
		let voteBlockIncludeAfterNBlocks = this.config.getVoteBlockIncludeAfterNBlocks(includingHeight);
		let beforeHeight = voteBeforeNBlocks + voteBlockIncludeAfterNBlocks;

		let finalizingHeight = includingHeight - beforeHeight;

		if(this.finalizedHeight < finalizingHeight && this.headerManager != null){
			let finalizedheader = this.headerManager.getNBlocksBefore(id, includingHeight, beforeHeight);

			if(finalizedheader != null){ // guard
				let fheaderId = finalizedheader.getId();
				this.__updateFinalizedData(finalizingHeight, fheaderId);

				// update
				this.finalizedHeight = finalizingHeight;
				this.__saveStatus();
			}
		}
	}

	private __updateFinalizedData(finalizingHeight : number, finalizingHeaderId : BlockHeaderId) : void {
		let lastFinalizedHeight = this.finalizedHeight;

		let list  =new ArrayList<BlockHeader>();

		// make list
		if(this.headerManager != null){
			let height = finalizingHeight;
			let currentHeaderId = <BlockHeaderId>(finalizingHeaderId.copyData());

			while(height > lastFinalizedHeight){
				let header = this.headerManager.getHeader(currentHeaderId, height);
				//assert(header != null);

				if(header != null){ // guard
					list.setElement(<BlockHeader>(header.copyData()), 0);

					// last header
					currentHeaderId = <BlockHeaderId>(header.getLastHeaderId().copyData());
					height--;
				}
			}
		}

		// to Hd wallet
		this.__importIntoHdWallet(list);


		// clean header store
		this.__finalizeHeaderStore(finalizingHeight, finalizingHeaderId);

	}

	private __importIntoHdWallet(list : ArrayList<BlockHeader>) : void {
		if(this.hdWallet != null){
			let waccount = this.hdWallet.getZoneAccount(this.zone);

			if(waccount != null){ // guard
				// import
				let maxLoop = list.size();
				for(let i = 0; i != maxLoop; ++i){
					let header = list.get(i);

					if(header != null){
						let headerId = header.getId();

						let trxGourp = this.transactionGroupData.getHeaderTransactionGroup(headerId);
						this.__importImportHeaderTransactionGroup(trxGourp, waccount);
					}
				}

				// clean
				for(let i = 0; i != maxLoop; ++i){
					let header = list.get(i);

					if(header != null){
						let headerId = header.getId();

						this.transactionGroupData.removeHeaderTransactionGroup(headerId);
					}
				}
			}
		}

	}

	private __importImportHeaderTransactionGroup(trxGourp : HeaderTransactionGroup, waccount : WalletAccount) : void {
		let list = trxGourp.getTransactionsList();

		let maxLoop = list.size();
		for(let i = 0; i != maxLoop; ++i){
			let trx = list.get(i);

			if(trx != null){
				waccount.importTransaction(trx);
			}
		}
	}

	private __finalizeHeaderStore(height : number, headerId : BlockHeaderId) {
		if(this.headerManager != null){
			this.headerManager.finalize(height, headerId, null);
		}
		throw new NullPointerException("transactionGroupData.__finalizeHeaderStore()");
	}


	public updateHeadDetection() : void {
		// detect header
		this.detector.reset();
		// Make header lines
		this.detector.buildHeads(this.zone, this, this.finalizedHeight);

		// evaluate
		this.detector.evaluate(this.zone, this, this.config);
		this.detector.selectChain();
	}

	private __saveStatus() {
		if(this.statusStore != null){
			this.statusStore.addShortValue(NetworkWalletData.KEY_ZONE, this.zone);
			this.statusStore.addLongValue(NetworkWalletData.KEY_FINALIZED_HEIGHT, this.finalizedHeight);
			return;
		}
		throw new NullPointerException("NetworkWalletData.__saveStatus()");
	}

	private __loadStatus() {
		if(this.statusStore != null){
			this.zone = this.statusStore.getShortValue(NetworkWalletData.KEY_ZONE);
			this.finalizedHeight = Number(this.statusStore.getLongValue(NetworkWalletData.KEY_FINALIZED_HEIGHT));
			return;
		}
		throw new NullPointerException("NetworkWalletData.__loadStatus()");
	}

	public getHeaderManager(zone : number) : BlockHeaderStoreManager {
		if(this.headerManager != null){
			return this.headerManager;
		}
		throw new NullPointerException("NetworkWalletData.getHeaderManager()");
	}

	public __initStatusStore() : void {
		if(this.statusStore == null){
			this.statusStore = new StatusStore(this.baseDir, NetworkWalletData.STATUS_STORE_FILE_NAME);
		}
	}

	public resetManagementAccounts() : void {
		this.managementAccounts.resetAll();
	}

	public buildManagementAccount(buildFinalized : boolean, startHeight : number) {
		if(buildFinalized){
			this.__buildFinalizedManagementAccount(startHeight);
		}

		// unfinalized
		this.__buildUnfinalizedAccount();

		// mempool
		this.__buildMempoolAccount();
	}

	private __buildMempoolAccount() : void {
		if(this.hdWallet != null){
			let waccount = this.hdWallet.getZoneAccount(this.zone);

			let uma = this.managementAccounts.getUnFinalizedManagementAccount();
			let ma = this.managementAccounts.getMempoolManagementAccount();

			ma.reset();
			ma.importOtherAccount(uma);

			if(waccount != null){
				// mempool scan
				let scanner =  this.mempool.getScanner();
				scanner.begin();

				while(scanner.hasNext()){
					let trx = scanner.next();
					let trxId = trx.getTransactionId();

					if(!uma.hasTransaction(trxId)){
						ma.addTransaction(trx, waccount);
					}
				}
			}
		}
	}

	private __buildUnfinalizedAccount() : void {
		let fma = this.managementAccounts.getFinalizedManagementAccount();
		let ma = this.managementAccounts.getUnFinalizedManagementAccount();

		ma.reset();
		ma.importOtherAccount(fma);

		// from detector
		{
			let head = this.detector.getHead();
			let list = head.getHeaders();

			let maxLoop = list.size();

			// i = 1, because the first element is finalized height
			let begin = this.finalizedHeight == 0 ? 0 : 1;
			for(let i = begin; i != maxLoop; ++i){
				let element = list.get(i);

				if(element != null){ // guard
					let header = element.getBlockHeader();
					this.__buildManagementAccount4Header(ma, header);
				}
			}
		}
	}

	private __buildFinalizedManagementAccount(startHeight : number) {
		let ma = this.managementAccounts.getFinalizedManagementAccount();
		let maxBlockHeight = this.finalizedHeight;

		this.___buildFinalizedManagementAccount(ma, startHeight, maxBlockHeight);
	}

	private ___buildFinalizedManagementAccount(ma : ManagementAccount, startHeight : number, maxBlockHeight : number) : void {
		if(this.hdWallet != null){ // guard
			let waccount = this.hdWallet.getZoneAccount(this.zone);

			if(waccount != null){ // guard
				let list = waccount.getTransactions();

				// import Hd wallet into Management Account
				let maxLoop = list.size();
				for(let i = 0; i != maxLoop; ++i){
					let trx = list.get(i);

					if(trx != null && (trx.checkFilteredUxtoRef(ma) || trx.checkFilteredAddress(waccount))){
						ma.addTransaction(trx, waccount);
					}
				}
			}
		}
	}

	private __buildManagementAccount4Header(ma : ManagementAccount, header : BlockHeader) {
		if(this.hdWallet != null){ // guard
			let waccount = this.hdWallet.getZoneAccount(this.zone);

			if(waccount != null){ // guard
				let height = header.getHeight();
				let headerId = header.getId();

				let trxGroup = this.transactionGroupData.getHeaderTransactionGroup(headerId);

				let list = trxGroup.getTransactionsList();
				let maxLoop = list.size();
				for(let i = 0; i != maxLoop; ++i){
					let trx = list.get(i);

					// check trx contains address
					if(trx != null && (trx.checkFilteredUxtoRef(ma) || trx.checkFilteredAddress(waccount))){
						ma.addTransaction(trx, waccount);
					}
				}
			}
		}
	}

	public getFinalizedHeight() : number {
		return this.finalizedHeight;
	}
}