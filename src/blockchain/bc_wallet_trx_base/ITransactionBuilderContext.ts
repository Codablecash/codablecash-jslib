import { HdWalleMuSigSignerProvidor } from "../bc_wallet/HdWalleMuSigSignerProvidor";
import { IWalletDataEncoder } from "../bc_wallet_encoder/IWalletDataEncoder";
import { IUtxoCollector } from "./IUtxoCollector";

export interface ITransactionBuilderContext {
	getMusigSignProvidor(encoder : IWalletDataEncoder) : HdWalleMuSigSignerProvidor ;
	getUtxoCollector() : IUtxoCollector;
}