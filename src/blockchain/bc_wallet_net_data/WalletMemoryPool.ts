import { NullPointerException } from "../../db/base/NullPointerException";
import { CFile } from "../../db/base_io/CFile";
import { SystemTimestampKey } from "../../db/base_timestamp/SystemTimestampKey";
import { SystemTimestampKeyFactory } from "../../db/base_timestamp/SystemTimestampKeyFactory";
import { Btree, BtreeOpenConfig } from "../../db/btree/Btree";
import { BtreeConfig } from "../../db/btree/BtreeConfig";
import { BtreeScanner } from "../../db/btree/BtreeScanner";
import { DiskCacheManager } from "../../db/random_access_file/DiskCacheManager";
import { TransactionData } from "../bc_base_trx_index/TransactionData";
import { TransactionDataFactory } from "../bc_base_trx_index/TransactionDataFactory";
import { TransactionIdKey } from "../bc_base_trx_index/TransactionIdKey";
import { TransactionIdKeyFactory } from "../bc_base_trx_index/TransactionIdKeyFactory";
import { AbstractBlockchainTransaction } from "../bc_trx/AbstractBlockchainTransaction";
import { TransactionId } from "../bc_trx/TransactionId";
import { WalletMemoryPoolScanner } from "./WalletMemoryPoolScanner";
import { WalletTransactionIdListData } from "./WalletTransactionIdListData";
import { WalletTransactionIdListDataFactory } from "./WalletTransactionIdListDataFactory";

export class WalletMemoryPool {
    public static readonly NAME_TRX_STORE = "trxStore";
    public static readonly NAME_TRX_ORDER_INDEX = "trxOrderIndex";

    private baseDir : CFile;
	private cacheManager : DiskCacheManager;

	private trxStore : Btree | null;
	private trxOrderIndex : Btree | null;

    constructor(baseDir : CFile) {
        this.baseDir = baseDir;
        this.cacheManager = new DiskCacheManager();
        this.trxStore = null;
        this.trxOrderIndex = null;
    }

    public exists() : boolean {
        let exTrxStore = false;
        {
            let fileName = WalletMemoryPool.NAME_TRX_STORE;

            let keyFactory = new TransactionIdKeyFactory();
            let dataFactory = new TransactionDataFactory();

            let btree = new Btree(this.baseDir, fileName, this.cacheManager, keyFactory, dataFactory);
            exTrxStore = btree.exists();
        }
        {
            let fileName = WalletMemoryPool.NAME_TRX_ORDER_INDEX;

            let keyFactory = new SystemTimestampKeyFactory();
            let dataFactory = new WalletTransactionIdListDataFactory();

            let btree = new Btree(this.baseDir, fileName, this.cacheManager, keyFactory, dataFactory);
            exTrxStore = exTrxStore || btree.exists();
        }

        return exTrxStore;
    }

    public createBlankPool() : void {
        if(this.baseDir.exists()){
            this.baseDir.deleteDir();
        }
        this.baseDir.mkdirs();

        {
            let fileName = WalletMemoryPool.NAME_TRX_STORE;

            let keyFactory = new TransactionIdKeyFactory();
            let dataFactory = new TransactionDataFactory();

            let btree = new Btree(this.baseDir, fileName, this.cacheManager, keyFactory, dataFactory);

            let config = new BtreeConfig();
            config.nodeNumber = 8;
            config.defaultSize = 1024;
            config.blockSize = 32;
            btree.create(config);
        }

        {
            let fileName = WalletMemoryPool.NAME_TRX_ORDER_INDEX;

            let keyFactory = new SystemTimestampKeyFactory();
            let dataFactory = new WalletTransactionIdListDataFactory();

            let btree = new Btree(this.baseDir, fileName, this.cacheManager, keyFactory, dataFactory);

            let config = new BtreeConfig();
            config.nodeNumber = 8;
            config.defaultSize = 1024;
            config.blockSize = 32;
            btree.create(config);
        }
    }

    public open() : void {
        if(!this.exists()){
            this.createBlankPool();
        }
        {
            let fileName = WalletMemoryPool.NAME_TRX_STORE;

            let keyFactory = new TransactionIdKeyFactory();
            let dataFactory = new TransactionDataFactory();

            this.trxStore = new Btree(this.baseDir, fileName, this.cacheManager, keyFactory, dataFactory);
            
            let opconf = new BtreeOpenConfig();
            opconf.numDataBuffer = 256;
            opconf.numNodeBuffer = 512;
            this.trxStore.open(opconf);
        }

        {
            let fileName = WalletMemoryPool.NAME_TRX_ORDER_INDEX;

            let keyFactory = new SystemTimestampKeyFactory();
            let dataFactory = new WalletTransactionIdListDataFactory();

            this.trxOrderIndex = new Btree(this.baseDir, fileName, this.cacheManager, keyFactory, dataFactory);

            let opconf = new BtreeOpenConfig();;
            opconf.numDataBuffer = 256;
            opconf.numNodeBuffer = 512;
            this.trxOrderIndex.open(opconf);
        }
    }

    public close() : void {
        if(this.trxStore != null){
            this.trxStore.close();
            this.trxStore = null;
        }
        if(this.trxOrderIndex != null){
            this.trxOrderIndex.close();
            this.trxOrderIndex = null;
        }
    }

    public putTransaction(trx : AbstractBlockchainTransaction) : void {
        let trxId = trx.getTransactionId();

        if(this.trxStore != null){
            let key = new TransactionIdKey(trxId);
            let data = new TransactionData(trx);

            this.trxStore.putData(key, data);
        }

        if(this.trxOrderIndex != null){
            let tm = trx.getTimestamp();
            let key = new SystemTimestampKey(tm);
            let data = new WalletTransactionIdListData();
            data.add(trxId);

            this.trxOrderIndex.putData(key, data);
        }
    }

    public removeTransaction(trxId : TransactionId) : void {
        let trx = this.getBlockchainTransaction(trxId);

        if(trx != null && this.trxStore != null && this.trxOrderIndex != null){
            {
                let key = new TransactionIdKey(trxId);
                this.trxStore.remove(key);
            }

            {
                let tm = trx.getTimestamp();
                let key = new SystemTimestampKey(tm);
                key.setRemoveKey(trxId);
                this.trxOrderIndex.remove(key);
            }
        }
    }

    public getBlockchainTransaction(trxId : TransactionId) : AbstractBlockchainTransaction | null {
        if(this.trxStore != null){
            let key = new TransactionIdKey(trxId);
            let obj = this.trxStore.findByKey(key);
            let data = <TransactionData>(obj);

            return data != null ? <AbstractBlockchainTransaction>(data.getTrx().copyData()) : null;
        }
        throw new NullPointerException("WalletMemoryPool.getBlockchainTransaction()");
    }

    public hasTransaction(trxId : TransactionId) : boolean {
        let trx = this.getBlockchainTransaction(trxId);

        return trx != null;
    }

    public getScanner() : WalletMemoryPoolScanner {
        let scanner = new WalletMemoryPoolScanner(this);
        return scanner;
    }

    public getBtreeScanner() : BtreeScanner {
        if(this.trxOrderIndex != null){
            let scanner = this.trxOrderIndex.getScanner();
            return scanner;
        }
        throw new NullPointerException("WalletMemoryPool.getBtreeScanner()");
    }
}