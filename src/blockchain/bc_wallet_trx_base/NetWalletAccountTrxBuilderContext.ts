import { HdWalleMuSigSignerProvidor } from "../bc_wallet/HdWalleMuSigSignerProvidor";
import { WalletAccount } from "../bc_wallet/WalletAccount";
import { IWalletDataEncoder } from "../bc_wallet_encoder/IWalletDataEncoder";
import { ManagementAccountsCollection } from "../bc_wallet_net_data_management/ManagementAccountsCollection";
import { ITransactionBuilderContext } from "./ITransactionBuilderContext";
import { IUtxoCollector } from "./IUtxoCollector";
import { NetWalletAccountUtxoCollector } from "./NetWalletAccountUtxoCollector";


export class NetWalletAccountTrxBuilderContext implements ITransactionBuilderContext {
	private account : WalletAccount;
	private encoder : IWalletDataEncoder;
	private managementAccounts : ManagementAccountsCollection;

    constructor(account : WalletAccount, encoder  :IWalletDataEncoder, managementAccounts: ManagementAccountsCollection){
        this.account = account;
        this.encoder = encoder;
        this.managementAccounts = managementAccounts;
    }

    public getMusigSignProvidor(encoder : IWalletDataEncoder) : HdWalleMuSigSignerProvidor {
        return new HdWalleMuSigSignerProvidor(this.account, this.encoder);
    }

    public getUtxoCollector() : IUtxoCollector {
        let managementAccount = this.managementAccounts.getMempoolManagementAccount();

        let collector = new NetWalletAccountUtxoCollector(managementAccount);
        collector.init();

        return collector;
    }
}