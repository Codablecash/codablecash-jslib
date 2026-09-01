import { IMuSigSigner } from "../../base/musig/IMuSigSigner";
import { NullPointerException } from "../../db/base/NullPointerException";
import { AddressDescriptor } from "../bc_base/AddressDescriptor";
import { IWalletDataEncoder } from "../bc_wallet_encoder/IWalletDataEncoder";
import { WalletAccount } from "./WalletAccount";


export class HdWalleMuSigSignerProvidor {
	private account : WalletAccount;
	private encoder : IWalletDataEncoder;

    constructor(account : WalletAccount, encoder : IWalletDataEncoder){
        this.account = account;
        this.encoder = encoder;
    }

    public getSigner(desc : AddressDescriptor) : IMuSigSigner {
        let ret =  this.account.getSigner(desc, this.encoder);
        if(ret != null){
            return ret;
        }
        throw new NullPointerException("HdWalleMuSigSignerProvidor.getSigner()");
    }
}