import { BalanceUtxo } from "../bc_trx_balance/BalanceUtxo";
import { IUtxoCollector } from "./IUtxoCollector";

export class HdWalletAccountUtxoCollector implements IUtxoCollector {

    hasNext(): boolean {
        throw new Error("Method not implemented.");
    }
    next(): BalanceUtxo {
        throw new Error("Method not implemented.");
    }

    // TODO

}