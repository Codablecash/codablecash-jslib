import { ArrayList } from "../../db/base/ArrayList";
import { BalanceUnit } from "../bc_base/BalanceUnit";
import { BalanceUtxo } from "../bc_trx_balance/BalanceUtxo";
import { BalanceUtxoSign } from "../bc_trx_balance/BalanceUtxoSign";
import { InputUtxoCollection } from "../bc_trx_balance/InputUtxoCollection";
import { AbstractBalanceTransaction } from "./AbstractBalanceTransaction";


export abstract class AbstractControlTransaction extends AbstractBalanceTransaction {
	protected inputs : InputUtxoCollection;
	protected list : ArrayList<BalanceUtxo>;
	protected fee : BalanceUnit;
	protected signature : BalanceUtxoSign | null;

    constructor(){
        super();
        this.inputs = new InputUtxoCollection();
        this.list = new ArrayList<BalanceUtxo>();
        this.fee = new BalanceUnit(0);
        this.signature = null;
    }
}