import { Btree } from "../../db/btree/Btree";
import { DiskCacheManager } from "../../db/random_access_file/DiskCacheManager";
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

    public getBalanceUtxo(utxoId: UtxoId): BalanceUtxo {
        throw new Error("Method not implemented.");
    }
}