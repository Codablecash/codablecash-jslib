import { NullPointerException } from "../../db/base/NullPointerException";
import { BtreeScanner } from "../../db/btree/BtreeScanner";
import { AbstractBlockchainTransaction } from "../bc_trx/AbstractBlockchainTransaction";
import { TransactionId } from "../bc_trx/TransactionId";
import { WalletMemoryPool } from "./WalletMemoryPool";
import { WalletTransactionIdListData } from "./WalletTransactionIdListData";


export class WalletMemoryPoolScanner {
	private pool : WalletMemoryPool;
	private scanner : BtreeScanner | null;
	private data : WalletTransactionIdListData | null;
	private trxId : TransactionId | null;

	constructor(pool : WalletMemoryPool){
		this.pool = pool;
		this.scanner = null;
		this.data = null;
		this.trxId = null;
	}

	public begin() : void {
		this.scanner = this.pool.getBtreeScanner();
		this.scanner.begin();
	}

	public hasNext() : boolean {
		this.trxId = this.data != null ? this.data.next() : null;

		if(this.trxId == null && this.scanner != null && this.scanner.hasNext()){
			let obj = this.scanner.next();

			this.data = <WalletTransactionIdListData>(obj.copyData());

			this.trxId = this.data.next();
		}

		return this.trxId != null;
	}

	public next() : AbstractBlockchainTransaction {
		let retTrx = null;
		if(this.trxId != null){
			retTrx = this.pool.getBlockchainTransaction(this.trxId);
		}

		if(retTrx != null){
			return retTrx;
		}
		throw new NullPointerException("WalletMemoryPoolScanner.next()");
	}
}