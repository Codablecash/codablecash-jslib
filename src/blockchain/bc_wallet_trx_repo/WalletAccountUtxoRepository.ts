import { CFile } from "../../db/base_io/CFile";
import { Btree, BtreeOpenConfig } from "../../db/btree/Btree";
import { BtreeConfig } from "../../db/btree/BtreeConfig";
import { DiskCacheManager } from "../../db/random_access_file/DiskCacheManager";
import { AddressDescriptorDataFactory } from "../bc_base_utxo_index/AddressDescriptorDataFactory";
import { AddressDescriptorKeyFactory } from "../bc_base_utxo_index/AddressDescriptorKeyFactory";
import { AddressDescriptorUtxoDataFactory } from "../bc_base_utxo_index/AddressDescriptorUtxoDataFactory";
import { UtxoIdKeyFactory } from "../bc_base_utxo_index/UtxoIdKeyFactory";


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

    public init() : void {
        {
            let fileName = WalletAccountUtxoRepository.FILE_NAME;

            let keyFactory = new AddressDescriptorKeyFactory();
            let dataFactory = new AddressDescriptorUtxoDataFactory();

            let btree = new Btree(this.accountBaseDir, fileName, this.cacheManager, keyFactory, dataFactory);

            let config = new BtreeConfig();
            config.nodeNumber = 8;
            config.defaultSize = 1024;
            config.blockSize = 32;
            btree.create(config);
        }

        {
            let fileName = WalletAccountUtxoRepository.UTXO_ID_INDEX_FILE_NAME;

            let keyFactory = new UtxoIdKeyFactory();
            let dataFactory = new AddressDescriptorDataFactory();

            let btree = new Btree(this.accountBaseDir, fileName, this.cacheManager, keyFactory, dataFactory);

            let config = new BtreeConfig();
            config.nodeNumber = 8;
            config.defaultSize = 1024;
            config.blockSize = 32;
            btree.create(config);
        }
    }

    public open() : void{
        this.close();

        {
            let fileName = WalletAccountUtxoRepository.FILE_NAME;

            let keyFactory = new AddressDescriptorKeyFactory();
            let dataFactory = new AddressDescriptorUtxoDataFactory();

            this.btree = new Btree(this.accountBaseDir, fileName, this.cacheManager, keyFactory, dataFactory);

            let opconf = new BtreeOpenConfig();
            opconf.numDataBuffer = 256;
            opconf.numNodeBuffer = 512;
            this.btree.open(opconf);
        }

        {
            let fileName = WalletAccountUtxoRepository.UTXO_ID_INDEX_FILE_NAME;

            let keyFactory = new UtxoIdKeyFactory();
            let dataFactory = new AddressDescriptorDataFactory();

            this.utxoIdBtree = new Btree(this.accountBaseDir, fileName, this.cacheManager, keyFactory, dataFactory);

            let opconf = new BtreeOpenConfig();
            opconf.numDataBuffer = 256;
            opconf.numNodeBuffer = 512;
            this.utxoIdBtree.open(opconf);
        }

    }

    public close() : void {
        if(this.btree != null){
            this.btree.close();
            this.btree = null;
        }

        if(this.utxoIdBtree != null){
            this.utxoIdBtree.close();
            this.utxoIdBtree = null;
        }
    }
}