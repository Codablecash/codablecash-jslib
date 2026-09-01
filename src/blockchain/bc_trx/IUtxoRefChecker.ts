import { AbstractUtxoReference } from "./AbstractUtxoReference";

export interface IUtxoRefChecker {
     checkUtxo(ref : AbstractUtxoReference) : boolean;
}