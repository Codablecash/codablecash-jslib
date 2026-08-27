import { ArrayList } from "../../db/base/ArrayList";
import { CFile } from "../../db/base_io/CFile";
import { StatusStore } from "../bc_base_conf_store/StatusStore";
import { IWalletDataEncoder } from "../bc_wallet_encoder/IWalletDataEncoder";
import { HdWalletSeed } from "./HdWalletSeed";
import { WalletAccount } from "./WalletAccount";

export class HdWallet {
	public static STORE_NAME = "HdWallet";
	public static KEY_ENCODED_SEED = "encodedSeed";
	public static KEY_NUM_ACCOUNTS = "numAccounts";
	public static KEY_DEFAULT_ZONE = "defaultZone";

	private baseDir : CFile;
	private accounts : ArrayList<WalletAccount>;
	private encodedSeed : HdWalletSeed | null;
	private defaultZone : number;
	private store : StatusStore;

	constructor(baseDir : CFile) {
		this.baseDir = baseDir;
		this.accounts = new ArrayList<WalletAccount>();
		this.encodedSeed = null;

		this.store = new StatusStore(baseDir, HdWallet.STORE_NAME);

		this.defaultZone = 0;
	}

	public static create(dir : CFile, seed : HdWalletSeed, defaultZone : number, encoder : IWalletDataEncoder, defaultMaxAddress : number) : HdWallet {
		let wallet = new HdWallet(dir);
		wallet.setSeed(seed, encoder);
		wallet.setDefaultZone(defaultZone);

		wallet.newAccount(seed, defaultZone, encoder, defaultMaxAddress);
		wallet.save();

		return wallet;
	}

	public setSeed(seed : HdWalletSeed, encoder : IWalletDataEncoder) : void {
		this.encodedSeed = seed.encodedSeed(encoder);
	}

	public newAccount(rootSeed : HdWalletSeed, zone : number, encoder : IWalletDataEncoder, maxAddress : number) {
		let accountIndex = this.accounts.size();
		let account = WalletAccount.newAccount(this.baseDir, rootSeed, accountIndex, zone, encoder, maxAddress);

		this.accounts.addElement(account);
		this.save();
	}

	public setDefaultZone(defaultZone : number) : void {
		this.defaultZone = defaultZone;
	}
	public getDefaultZone() : number {
		return this.defaultZone;
	}

	public save() : void {
		if(this.encodedSeed != null){
			let buff = this.encodedSeed.getByteBuffer();
			this.store.addBinaryValue(HdWallet.KEY_ENCODED_SEED, buff.toUint8Array(), buff.limit());
		}
		this.store.addShortValue(HdWallet.KEY_NUM_ACCOUNTS, this.accounts.size());
		this.store.addShortValue(HdWallet.KEY_DEFAULT_ZONE, this.defaultZone);
	}

	public load(encoder : IWalletDataEncoder) {
		this.store.load();
		{
			let buff = this.store.getBinaryValue(HdWallet.KEY_ENCODED_SEED);
			this.encodedSeed = new HdWalletSeed(buff.toUint8Array(), buff.limit());
		}

		let numAccounts = this.store.getShortValue(HdWallet.KEY_NUM_ACCOUNTS);
		for(let i = 0; i != numAccounts; ++i){
			let account = WalletAccount.loadAccount(this.baseDir, i, encoder);
			this.accounts.addElement(account);
		}

		this.defaultZone = this.store.getShortValue(HdWallet.KEY_DEFAULT_ZONE);
	}
}