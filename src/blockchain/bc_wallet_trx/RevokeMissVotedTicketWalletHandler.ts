import { AbstractBlockchainTransaction } from "../bc_trx/AbstractBlockchainTransaction";
import { WalletAccount } from "../bc_wallet/WalletAccount";
import { AbstractWalletTransactionHandler } from "./AbstractWalletTransactionHandler";

export class RevokeMissVotedTicketWalletHandler extends AbstractWalletTransactionHandler {
    constructor(account : WalletAccount){
        super(account);
    }

    public importTransaction(__trx : AbstractBlockchainTransaction) : void {
        this.__importTransaction(__trx);
    }
}
