import { NullPointerException } from "../../db/base/NullPointerException";
import { Btree, BtreeOpenConfig } from "../../db/btree/Btree";
import { BtreeConfig } from "../../db/btree/BtreeConfig";
import { DiskCacheManager } from "../../db/random_access_file/DiskCacheManager";
import { TransactionDataFactory } from "../bc_base_trx_index/TransactionDataFactory";
import { TransactionIdKeyFactory } from "../bc_base_trx_index/TransactionIdKeyFactory";
import { AbstractUtxo } from "../bc_trx/AbstractUtxo";
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

    public getUtxo(utxoId : UtxoId) : AbstractUtxo {
        if(this.utxoRepo != null){
            let u = this.utxoRepo.getUtxo(utxoId);
            if(u != null){
                return u;
            } 
        }
        throw new NullPointerException("WalletAccountTrxRepository.getUtxo()");
    }

    private closeSelf() : void {
        if(this.btree != null){
            this.btree.close();
            this.btree = null;
        }
    }
}