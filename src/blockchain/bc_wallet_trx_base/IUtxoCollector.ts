import { BalanceUtxo } from "../bc_trx_balance/BalanceUtxo";

export interface IUtxoCollector {
    hasNext() : boolean;
	next() : BalanceUtxo;
}