import { HdWalletSeed } from "../bc_wallet/HdWalletSeed";

export interface IWalletDataEncoder {
    encode(seed : HdWalletSeed) : HdWalletSeed;
}