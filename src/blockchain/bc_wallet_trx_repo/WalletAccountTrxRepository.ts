import { ArrayList } from "../../db/base/ArrayList";
import { NullPointerException } from "../../db/base/NullPointerException";
import { Btree, BtreeOpenConfig } from "../../db/btree/Btree";
import { BtreeConfig } from "../../db/btree/BtreeConfig";
import { BtreeScanner } from "../../db/btree/BtreeScanner";
import { DiskCacheManager } from "../../db/random_access_file/DiskCacheManager";
import { AddressDescriptor } from "../bc_base/AddressDescriptor";
import { BalanceUnit } from "../bc_base/BalanceUnit";
import { TransactionData } from "../bc_base_trx_index/TransactionData";
import { TransactionDataFactory } from "../bc_base_trx_index/TransactionDataFactory";
import { TransactionIdKey } from "../bc_base_trx_index/TransactionIdKey";
import { TransactionIdKeyFactory } from "../bc_base_trx_index/TransactionIdKeyFactory";
import { AbstractBlockchainTransaction } from "../bc_trx/AbstractBlockchainTransaction";
import { AbstractUtxo } from "../bc_trx/AbstractUtxo";
import { TransactionId } from "../bc_trx/TransactionId";
import { UtxoId } from "../bc_trx/UtxoId";
import { BalanceUtxo } from "../bc_trx_balance/BalanceUtxo";
import { IUtxoFinder } from "../bc_trx_balance/IUtxoFinder";
import { WalletAccount } from "../bc_wallet/WalletAccount";
import { WalletAccountUtxoRepository } from "./WalletAccountUtxoRepository";

export class WalletAccountTrxRepository implements IUtxoFinder {
    public static readonly FILE_NAME = "transactions";

	private account : WalletAccount;

	private cacheManager : DiskCacheManager;
	private btree : Btree | null;

	private utxoRepo : WalletAccountUtxoRepository | null;

    constructor(account : WalletAccount){
        this.account = account;
        this.utxoRepo = null;
        this.cacheManager = new DiskCacheManager();
        this.btree = null;
    }

    public init() : void {
        this.initSelf();

        this.utxoRepo = new WalletAccountUtxoRepository(this.account.getAccountBaseDir());

        // create btree
        this.utxoRepo.init();

        this.close();
    }

    public open() {
        this.openSelf();

        this.utxoRepo = new WalletAccountUtxoRepository(this.account.getAccountBaseDir());
        this.utxoRepo.open();
    }

    public close() {
        this.closeSelf();

        if(this.utxoRepo != null){
            this.utxoRepo.close();
            this.utxoRepo = null;
        }
    }

    private initSelf() : void {
        let fileName = WalletAccountTrxRepository.FILE_NAME;

        let keyFactory = new TransactionIdKeyFactory();
        let dataFactory = new TransactionDataFactory();

        let btree = new Btree(this.account.getAccountBaseDir(), fileName, this.cacheManager, keyFactory, dataFactory);

        let config = new BtreeConfig();
        config.nodeNumber = 8;
        config.defaultSize = 1024;
        config.blockSize = 32;
        btree.create(config);
    }

    private openSelf() : void  {
        this.closeSelf();

        let fileName = WalletAccountTrxRepository.FILE_NAME;

        let keyFactory = new TransactionIdKeyFactory();
        let dataFactory = new TransactionDataFactory();

        this.btree = new Btree(this.account.getAccountBaseDir(), fileName, this.cacheManager, keyFactory, dataFactory);

        let opconf = new BtreeOpenConfig();
        opconf.numDataBuffer = 256;
        opconf.numNodeBuffer = 512;
        this.btree.open(opconf);
    }

    public getBalanceUtxo(utxoId : UtxoId) : BalanceUtxo {
        if(this.utxoRepo != null){
            let r = this.utxoRepo.getBalanceUtxo(utxoId);
            if(r != null){
                return r;
            }
        }
        throw new NullPointerException("WalletAccountTrxRepository.getBalanceUtxo()");
    }

    public getUtxo(utxoId : UtxoId) : AbstractUtxo | null {
        if(this.utxoRepo != null){
            return this.utxoRepo.getUtxo(utxoId);
        }
        throw new NullPointerException("WalletAccountTrxRepository.getUtxo()");
    }

    private closeSelf() : void {
        if(this.btree != null){
            this.btree.close();
            this.btree = null;
        }
    }

    public importUtxo(utxo : AbstractUtxo) : void {
        if(this.utxoRepo != null){
            this.utxoRepo.importUtxo(utxo);
            return;
        }
        throw new NullPointerException("WalletAccountTrxRepository.importUtxo()");
    }

    public importTransaction(trx : AbstractBlockchainTransaction) : void {
        if(this.btree != null){
            let key = new TransactionIdKey(trx.getTransactionId());
            let data = new TransactionData(trx);

            this.btree.putData(key, data);
            return;
        }
        throw new NullPointerException("WalletAccountTrxRepository.importUtxo()");
    }

    public findTransaction(trxId : TransactionId) : AbstractBlockchainTransaction | null {
        if(this.btree != null){
            let key = new TransactionIdKey(trxId);
            let object = this.btree.findByKey(key);
            let data = <TransactionData>(object);

            return data != null ? <AbstractBlockchainTransaction>(data.getTrx().copyData()) : null;
        }
        throw new NullPointerException("WalletAccountTrxRepository.findTransaction()");
    }

    public removeTransaction(trxId : TransactionId) : void {
        if(this.btree != null){
            let key = new TransactionIdKey(trxId);
            this.btree.remove(key);
        }
    }

    public removeUtxo(utxoId : UtxoId) {
        if(this.utxoRepo != null){
            this.utxoRepo.removeUtxo(utxoId);
        }
    }

    public getTotalAmount() : BalanceUnit {
        if(this.utxoRepo != null){
            return this.utxoRepo.getTotalAmount();
        }
        throw new NullPointerException("WalletAccountTrxRepository.getTotalAmount()");
    }

    public getBalanceUtxos(desc : AddressDescriptor) : ArrayList<BalanceUtxo> | null{
        if(this.utxoRepo != null){
            let list =  this.utxoRepo.getBalanceUtxos(desc);
            return list;
        }
        throw new NullPointerException("WalletAccountTrxRepository.getBalanceUtxos()");
    }

    public getScanner() : BtreeScanner {
        if(this.btree != null){
            let scanner = this.btree.getScanner();
            scanner.begin();

            return scanner;
        }
        throw new NullPointerException("WalletAccountTrxRepository.getScanner()");
    }
}