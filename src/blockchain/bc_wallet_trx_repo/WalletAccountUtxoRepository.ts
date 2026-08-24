import { CFile } from "../../db/base_io/CFile";
import { Btree } from "../../db/btree/Btree";
import { DiskCacheManager } from "../../db/random_access_file/DiskCacheManager";


export class WalletAccountUtxoRepository {
    public static readonly FILE_NAME = "utxos";
	public static readonly UTXO_ID_INDEX_FILE_NAME = "utxo_id_index";

	private accountBaseDir : CFile;
	private cacheManager : DiskCacheManager;
	private btree : Btree | null;
	private utxoIdBtree : Btree | null;

    constructor(accountBaseDir : CFile){
        this.accountBaseDir = accountBaseDir;
        this.cacheManager = new DiskCacheManager();
        this.btree = null;
        this.utxoIdBtree = null;
    }
}