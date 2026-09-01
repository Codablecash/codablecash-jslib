import { IMuSigSigner } from "../../base/musig/IMuSigSigner";
import { ArrayList } from "../../db/base/ArrayList";
import { NullPointerException } from "../../db/base/NullPointerException";
import { CFile } from "../../db/base_io/CFile";
import { BtreeScanner } from "../../db/btree/BtreeScanner";
import { AddressDescriptor } from "../bc_base/AddressDescriptor";
import { BalanceUnit } from "../bc_base/BalanceUnit";
import { StatusStore } from "../bc_base_conf_store/StatusStore";
import { TransactionData } from "../bc_base_trx_index/TransactionData";
import { AbstractBlockchainTransaction } from "../bc_trx/AbstractBlockchainTransaction";
import { IAddressChecker } from "../bc_trx/IAddressChecker";
import { TransactionId } from "../bc_trx/TransactionId";
import { IWalletDataEncoder } from "../bc_wallet_encoder/IWalletDataEncoder";
import { BloomFilter1024 } from "../bc_wallet_filter/BloomFilter1024";
import { AbstractWalletTransactionHandler } from "../bc_wallet_trx/AbstractWalletTransactionHandler";
import { GenesisTransactionHandler } from "../bc_wallet_trx/GenesisTransactionHandler";
import { WalletAccountTrxRepository } from "../bc_wallet_trx_repo/WalletAccountTrxRepository";
import { AbstractAddressStore } from "./AbstractAddressStore";
import { AbstractWalletAccount } from "./AbstractWalletAccount";
import { ChangeAddressStore } from "./ChangeAddressStore";
import { HdWalletSeed } from "./HdWalletSeed";
import { ReceivingAddressStore } from "./ReceivingAddressStore";

export class WalletAccount extends AbstractWalletAccount implements IAddressChecker {
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

	public getWalletAccountTrxRepository() : WalletAccountTrxRepository {
        if(this.trxRepo != null){
            return this.trxRepo;
        }
		throw new NullPointerException("WalletAccount.getWalletAccountTrxRepository()");
	}

	public getReceivingAddresses() : ReceivingAddressStore {
        if(this.receivingAddresses != null){
		    return this.receivingAddresses;
        }
        throw new NullPointerException("WalletAccount.getReceivingAddresses()");
	}
	public  getChangeAddresses() : ChangeAddressStore {
        if(this.changeAddresses != null){
            return this.changeAddresses;
        }
		throw new NullPointerException("WalletAccount.getChangeAddresses()");
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

    public importTransaction(trx : AbstractBlockchainTransaction) : void{
        let type = trx.getType();

        let handler : AbstractWalletTransactionHandler;

        switch(type){
        case AbstractBlockchainTransaction.TRX_TYPE_GENESIS:
            handler = new GenesisTransactionHandler(this);
            break;
        case AbstractBlockchainTransaction.TRX_TYPE_BANANCE_TRANSFER:
            handler = new BalanceTransactionWalletHandler(this);
            break;
            // TODO importTransaction
        default:
            throw new NullPointerException("WalletAccount.importTransaction()");
        }
    }

    public getReceivingAddressDescriptor(i : number) : AddressDescriptor {
        if(this.receivingAddresses != null){
            return this.receivingAddresses.getAddressDescriptor(i);
        }
        throw new NullPointerException("WalletAccount.getReceivingAddressDescriptor()");
    }

    public findTransaction(trxId : TransactionId) : AbstractBlockchainTransaction | null {
        if(this.trxRepo != null){
            return this.trxRepo.findTransaction(trxId);
        }
        throw new NullPointerException("WalletAccount.findTransaction()");
    }

    public removeTransaction(trxId : TransactionId){
        if(this.trxRepo != null){
            this.trxRepo.removeTransaction(trxId);
        }
        throw new NullPointerException("WalletAccount.removeTransaction()");
    }

    public hasAddress(addressDesc : AddressDescriptor) {
        if(this.receivingAddresses != null && this.changeAddresses != null){
            return this.findAddressDiscriptor(this.receivingAddresses, addressDesc) >= 0
                    || this.findAddressDiscriptor(this.changeAddresses, addressDesc) >= 0;
        }
        throw new NullPointerException("WalletAccount.hasAddress()");
    }

    public findAddressDiscriptor(store : AbstractAddressStore, addressDesc : AddressDescriptor) {
        let ret = -1;

        let maxLoop = store.size();
        for(let i = 0; i != maxLoop; ++i){
            let desc = store.getAddressDescriptor(i);
            if(desc.compareTo(addressDesc) == 0){
                ret = i;
                break;
            }
        }

        return ret;
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

    public getTransactions() : ArrayList<AbstractBlockchainTransaction> {
        if(this.trxRepo != null){
            let list = new ArrayList<AbstractBlockchainTransaction>();

            let scanner = this.trxRepo.getScanner();
            while(scanner.hasNext()){
                let obj = scanner.next();
                let data = <TransactionData>(obj);

                list.addElement(<AbstractBlockchainTransaction>(data.getTrx().copyData()));
            }

            return list;
        }
        throw new NullPointerException("WalletAccount.getTransactions()");
    }

    public getBloomFilter(encoder : IWalletDataEncoder) : BloomFilter1024 {
        if(this.bloomFilter == null){
            this.createBloomFilter(encoder);
        }

        if(this.bloomFilter != null){
            return this.bloomFilter;
        }
        throw new NullPointerException("WalletAccount.getBloomFilter()");
    }

    public createBloomFilter(encoder : IWalletDataEncoder) : void {
        if(this.receivingAddresses != null && this.changeAddresses != null){
            this.bloomFilter = new BloomFilter1024();

            this.receivingAddresses.exportAddress2Filter(this.bloomFilter);
            this.changeAddresses.exportAddress2Filter(this.bloomFilter, encoder);
            return;
        }
        throw new NullPointerException("WalletAccount.createBloomFilter()");
    }

    public checkAddress(desc : AddressDescriptor) : boolean {
        if(this.receivingAddresses != null && this.changeAddresses != null){
            return this.receivingAddresses.hasAddress(desc) || this.changeAddresses.hasAddress(desc);
        }
        throw new NullPointerException("WalletAccount.checkAddress()");
    }

    public getSigner(desc : AddressDescriptor, encoder : IWalletDataEncoder) : IMuSigSigner | null {
        if(this.receivingAddresses != null && this.changeAddresses != null){
            let signer = this.receivingAddresses.getSigner(desc, encoder);
            if(signer != null){
                return signer;
            }

            signer = this.changeAddresses.getSigner(desc, encoder);
            return signer;
        }
        throw new NullPointerException("WalletAccount.getSigner()");
    }
}