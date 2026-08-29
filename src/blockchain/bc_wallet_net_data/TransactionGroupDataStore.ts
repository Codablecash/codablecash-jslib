import { CFile } from "../../db/base_io/CFile";
import { Btree } from "../../db/btree/Btree";
import { DiskCacheManager } from "../../db/random_access_file/DiskCacheManager";


export class TransactionGroupDataStore {
    public static FILE_NAME = "unfinalized_data";

    private baseDir : CFile;
	private cacheManager : DiskCacheManager;
	private headerGroupStore : Btree | null;

    constructor(baseDir : CFile) {
        this.baseDir = baseDir;
        this.cacheManager = new DiskCacheManager();
        this.headerGroupStore = null;        
    }

    // TODO
/*
void open() {
	UnicodeString fileName(FILE_NAME);

	BlockHeaderIdKeyFactory* keyFactory = new BlockHeaderIdKeyFactory(); __STP(keyFactory);
	HeaderTransactionGroupDataFactory* dataFactory = new HeaderTransactionGroupDataFactory(); __STP(dataFactory);

	this.headerGroupStore = new Btree(this.baseDir, &fileName, this.cacheManager, keyFactory, dataFactory);

	BtreeOpenConfig opconf;
	opconf.numDataBuffer = 256;
	opconf.numNodeBuffer = 512;
	this.headerGroupStore.open(&opconf);

}

void close() noexcept {
	if(this.headerGroupStore != nullptr){
		this.headerGroupStore.close();
		delete this.headerGroupStore, this.headerGroupStore = nullptr;
	}
}

void add(const BlockHeaderId *headerId, const HeaderTransactionGroup *group) {
	BlockHeaderIdKey key(headerId);

	this.headerGroupStore.putData(&key, group);
}

HeaderTransactionGroup* getHeaderTransactionGroup(const BlockHeaderId *headerId) const {
	BlockHeaderIdKey key(headerId);

	IBlockObject* object = this.headerGroupStore.findByKey(&key);
	HeaderTransactionGroup* trxGroup = dynamic_cast<HeaderTransactionGroup*>(object);

	assert(trxGroup != nullptr);

	return trxGroup;
}

bool removeHeaderTransactionGroup(const BlockHeaderId *headerId) {
	BlockHeaderIdKey key(headerId);

	bool ret = this.headerGroupStore.remove(&key);
	return ret;
}


*/
}