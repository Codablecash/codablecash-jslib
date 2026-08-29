import { ArrayList } from "../../db/base/ArrayList";
import { ManagementAccount } from "./ManagementAccount";


export class ManagementAccountsCollection {
	public static readonly POS_FINALIZED = 0;
	public static readonly POS_UNFINALIZED = 1;
	public static readonly POS_MEMPOOL = 2;

    static RECORD_SOTRE_TYPE_TO_INXED(storeType : number) : number {
        return storeType - 1;
    }

    private list : ArrayList<ManagementAccount>;

    // TODO implement
}