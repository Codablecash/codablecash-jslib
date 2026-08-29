import { ArrayList } from "../../db/base/ArrayList";
import { NullPointerException } from "../../db/base/NullPointerException";
import { TransactionId } from "../bc_trx/TransactionId";
import { ManagedUtxoCacheRecord } from "./ManagedUtxoCacheRecord";
import { ManagementAccount } from "./ManagementAccount";


export class ManagementAccountsCollection {
	public static readonly POS_FINALIZED = 0;
	public static readonly POS_UNFINALIZED = 1;
	public static readonly POS_MEMPOOL = 2;

    static RECORD_SOTRE_TYPE_TO_INXED(storeType : number) : number {
        return storeType - 1;
    }

    private list : ArrayList<ManagementAccount>;

    constructor(){
        this.list = new ArrayList<ManagementAccount>();
        this.list.addElement(new ManagementAccount(ManagedUtxoCacheRecord.FINALIZED));
        this.list.addElement(new ManagementAccount(ManagedUtxoCacheRecord.UNFINALIZED));
        this.list.addElement(new ManagementAccount(ManagedUtxoCacheRecord.MEMPOOL));
    }

    public resetAll() : void {
        this.resetFinalized();
        this.resetUnfinalized();
        this.resetMempool();
    }

    public resetFinalized() : void {
        let account = this.list.get(ManagementAccountsCollection.POS_FINALIZED);
        if(account != null){
            account.reset();
        }
    }

    public resetUnfinalized() : void {
        let account = this.list.get(ManagementAccountsCollection.POS_UNFINALIZED);
        if(account != null){
            account.reset();
        }
    }

    public resetMempool() : void {
        let account = this.list.get(ManagementAccountsCollection.POS_MEMPOOL);
        if(account != null){
            account.reset();
        }
    }

    public getFinalizedManagementAccount() : ManagementAccount {
        return this.getManagementAccount(ManagementAccountsCollection.POS_FINALIZED);
    }

    public getUnFinalizedManagementAccount() : ManagementAccount {
        return this.getManagementAccount(ManagementAccountsCollection.POS_UNFINALIZED);
    }

    public getMempoolManagementAccount() : ManagementAccount {
        return this.getManagementAccount(ManagementAccountsCollection.POS_MEMPOOL);
    }

    public getManagementAccount(pos : number) : ManagementAccount {
        let ac =  this.list.get(pos);
        if(ac != null){
            return ac;
        }
        throw new NullPointerException("ManagementAccountsCollection.getManagementAccount()");
    }

    public getTransactionStoreStatus(trxId : TransactionId) : number {
        let storeType = ManagedUtxoCacheRecord.NONE;

        let memPool = this.getMempoolManagementAccount();
        let unFinalized = this.getUnFinalizedManagementAccount();
        let finalized = this.getFinalizedManagementAccount();

        // mempool
        if(memPool.hasTransaction(trxId) && !unFinalized.hasTransaction(trxId)) {
            storeType = ManagedUtxoCacheRecord.MEMPOOL;
        }

        // unfinalized
        if(storeType == ManagedUtxoCacheRecord.NONE && unFinalized.hasTransaction(trxId)){
            storeType = ManagedUtxoCacheRecord.UNFINALIZED;
        }

        // finalized
        if(storeType == ManagedUtxoCacheRecord.NONE && finalized.hasTransaction(trxId)){
            storeType = ManagedUtxoCacheRecord.FINALIZED;
        }

        return storeType;
    }
}