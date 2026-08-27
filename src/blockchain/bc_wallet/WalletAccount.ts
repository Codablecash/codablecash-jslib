import { NullPointerException } from "../../db/base/NullPointerException";
import { CFile } from "../../db/base_io/CFile";
import { AddressDescriptor } from "../bc_base/AddressDescriptor";
import { BalanceUnit } from "../bc_base/BalanceUnit";
import { StatusStore } from "../bc_base_conf_store/StatusStore";
import { IWalletDataEncoder } from "../bc_wallet_encoder/IWalletDataEncoder";
import { BloomFilter1024 } from "../bc_wallet_filter/BloomFilter1024";
import { WalletAccountTrxRepository } from "../bc_wallet_trx_repo/WalletAccountTrxRepository";
import { AbstractWalletAccount } from "./AbstractWalletAccount";
import { ChangeAddressStore } from "./ChangeAddressStore";
import { HdWalletSeed } from "./HdWalletSeed";
import { ReceivingAddressStore } from "./ReceivingAddressStore";

export class WalletAccount extends AbstractWalletAccount{
	public static STORE_NAME = "WalletAccount";
	public static KEY_ENCRYPTED_SEED = "encryptedSeed";

    private accountBaseDir : CFile;

	private receivingAddresses : ReceivingAddressStore | null;
	private changeAddresses : ChangeAddressStore | null;

	private encryptedSeed : HdWalletSeed | null;

	private trxRepo : WalletAccountTrxRepository | null;

	private store : StatusStore;

	private bloomFilter : BloomFilter1024 | null;

    constructor(accountBaseDir : CFile){
        super(0, 0);
        this.accountBaseDir = accountBaseDir;

    	this.receivingAddresses = null;
        this.changeAddresses = null;
        this.encryptedSeed = null;
        this.trxRepo = null;

        this.store = new StatusStore(accountBaseDir, WalletAccount.STORE_NAME);
        this.bloomFilter = null;
    }

	public getAccountBaseDir() : CFile {
		return this.accountBaseDir;
	}

    public setEncryptedSeed(encrypted : HdWalletSeed) : void {
        this.encryptedSeed = encrypted;
    }

    public static newAccount(baseDir : CFile, rootSeed : HdWalletSeed, accountIndex : number, zone : number
            , encoder : IWalletDataEncoder, maxAddress : number) : WalletAccount {
        let seg = "";
        seg = seg + accountIndex;
        let accountBase = baseDir.get(seg);

        let account = new WalletAccount(accountBase);
        account.accountIndex = accountIndex;
        account.zone = zone;

        let seed = rootSeed.indexedSeed(accountIndex);
        let encryptedSeed = seed.encodedSeed(encoder);
        account.setEncryptedSeed(encryptedSeed);

        account.initAddressStores(encoder, maxAddress);
        account.initTransactionRepository();
        account.save();

        return account;
    }

    public static loadAccount(baseDir : CFile, accountIndex : number, encoder : IWalletDataEncoder) : WalletAccount {
        let seg = "";
        seg = seg + accountIndex;
        let accountBase = baseDir.get(seg);

        let account = new WalletAccount(accountBase);
        account.load(encoder);

        return account;
    }

    public initTransactionRepository() : void {
        this.trxRepo = new WalletAccountTrxRepository(this);
        this.trxRepo.init();
        this.trxRepo.open();
    }


    public initAddressStores(encoder : IWalletDataEncoder, maxAddress : number) : void{
        if(this.encryptedSeed){
            let accountRootSeed = encoder.decode(this.encryptedSeed);

            this.initReceivingAddressStore(accountRootSeed, maxAddress, encoder);
            this.initChangeAddressStore(accountRootSeed, encoder, maxAddress);
            return;
        }
        throw new NullPointerException("WalletAccount.initAddressStores()");
    }

    private initReceivingAddressStore(rootAccountSeed : HdWalletSeed, maxAddressCount : number, encoder : IWalletDataEncoder) {
        this.receivingAddresses = new ReceivingAddressStore(this.zone, maxAddressCount, this.accountBaseDir);

        let s = rootAccountSeed.indexedSeed(1);
        let encrypted = encoder.encode(s);

        this.receivingAddresses.setEncryptedSeed(encrypted);

        this.receivingAddresses.init(encoder);
    }

    private initChangeAddressStore(rootAccountSeed : HdWalletSeed, encoder : IWalletDataEncoder, numAddressInThisGroup : number) {
        this.changeAddresses = new ChangeAddressStore(this.zone, numAddressInThisGroup, this.accountBaseDir);

        let s = rootAccountSeed.indexedSeed(2);
        let encrypted = encoder.encode(s);

        this.changeAddresses.setEncryptedSeed(encrypted);
        this.changeAddresses.init(encoder);
    }

    public getReceivingAddressDescriptor(i : number) : AddressDescriptor {
        if(this.receivingAddresses != null){
            return this.receivingAddresses.getAddressDescriptor(i);
        }
        throw new NullPointerException("WalletAccount.getReceivingAddressDescriptor()");
    }

    public getTotalAmount() : BalanceUnit {
        if(this.trxRepo != null){
            return this.trxRepo.getTotalAmount();
        }
        throw new NullPointerException("WalletAccount.getTotalAmount()");
    }

    public save() : void {
        if(this.encryptedSeed != null){
            let buff = this.encryptedSeed.getByteBuffer();
            this.store.addBinaryValue(WalletAccount.KEY_ENCRYPTED_SEED, buff.toUint8Array(), buff.limit());
        }

        if(this.receivingAddresses != null){
            this.receivingAddresses.save();
        }
        if(this.changeAddresses != null){
            this.changeAddresses.save();
        }
    }

    public load(encoder : IWalletDataEncoder) {
        this.store.load();
        {
            let buff = this.store.getBinaryValue(WalletAccount.KEY_ENCRYPTED_SEED);
              this.encryptedSeed = new HdWalletSeed(buff.toUint8Array(), buff.limit());
        }

        this.receivingAddresses = new ReceivingAddressStore(0, 512, this.accountBaseDir);
        this.changeAddresses = new ChangeAddressStore(0, 0, this.accountBaseDir);

        this.receivingAddresses.load(encoder);
        this.changeAddresses.load(encoder);

        this.trxRepo = new WalletAccountTrxRepository(this);
        this.trxRepo.open();
    }
}