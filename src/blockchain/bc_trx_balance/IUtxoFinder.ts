import { UtxoId } from "../bc_trx/UtxoId";
import { BalanceUtxo } from "./BalanceUtxo";

export interface IUtxoFinder {
    getBalanceUtxo(utxoId : UtxoId) : BalanceUtxo;
}