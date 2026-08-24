import { CFile } from "../../db/base_io/CFile";
import { AbstractWalletAccount } from "./AbstractWalletAccount";

export class WalletAccount extends AbstractWalletAccount {
    private accountBaseDir : CFile;

    constructor(accountBaseDir : CFile){
        super(0, 0);
        this.accountBaseDir = accountBaseDir;
    }

	public getAccountBaseDir() : CFile {
		return this.accountBaseDir;
	}
}