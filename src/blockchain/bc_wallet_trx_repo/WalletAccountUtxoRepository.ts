import { ArrayList } from "../../db/base/ArrayList";
import { NullPointerException } from "../../db/base/NullPointerException";
import { CFile } from "../../db/base_io/CFile";
import { Btree, BtreeOpenConfig } from "../../db/btree/Btree";
import { BtreeConfig } from "../../db/btree/BtreeConfig";
import { BtreeScanner } from "../../db/btree/BtreeScanner";
import { DiskCacheManager } from "../../db/random_access_file/DiskCacheManager";
import { AddressDescriptor } from "../bc_base/AddressDescriptor";
import { BalanceUnit } from "../bc_base/BalanceUnit";
import { AddressDescriptorData } from "../bc_base_utxo_index/AddressDescriptorData";
import { AddressDescriptorDataFactory } from "../bc_base_utxo_index/AddressDescriptorDataFactory";
import { AddressDescriptorKey } from "../bc_base_utxo_index/AddressDescriptorKey";
import { AddressDescriptorKeyFactory } from "../bc_base_utxo_index/AddressDescriptorKeyFactory";
import { AddressDescriptorUtxoData } from "../bc_base_utxo_index/AddressDescriptorUtxoData";
import { AddressDescriptorUtxoDataFactory } from "../bc_base_utxo_index/AddressDescriptorUtxoDataFactory";
import { UtxoIdKey } from "../bc_base_utxo_index/UtxoIdKey";
import { UtxoIdKeyFactory } from "../bc_base_utxo_index/UtxoIdKeyFactory";
import { AbstractUtxo } from "../bc_trx/AbstractUtxo";
import { UtxoId } from "../bc_trx/UtxoId";
import { BalanceUtxo } from "../bc_trx_balance/BalanceUtxo";


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

    public importUtxo(utxo : AbstractUtxo) : void{
        if(this.btree != null){
            let key = new AddressDescriptorKey(utxo.getAddress());
            let data = new AddressDescriptorUtxoData();
            data.add(utxo);

            this.btree.putData(key, data);
        }

        if(this.utxoIdBtree != null){
            let utxoId = utxo.getId();
            let desc = utxo.getAddress();
            let key = new UtxoIdKey(utxoId);
            let data = new AddressDescriptorData(desc);

            this.utxoIdBtree.putData(key, data);
        }
    }

    public removeUtxo(utxoId : UtxoId) : void {
        let utxo = this.getUtxo(utxoId);
        //assert(utxo != nullptr);

        if(utxo != null){
            let desc = utxo.getAddress();
            if(this.btree != null){
                let key = new AddressDescriptorKey(desc);
                key.setUtxo(utxo);
                this.btree.remove(key);
            }
            if(this.utxoIdBtree != null){
                let key = new UtxoIdKey(utxoId);
                this.utxoIdBtree.remove(key);
            }
        }
    }

    public getTotalAmount() : BalanceUnit {
        if(this.btree != null){
            let ret = new BalanceUnit(0);

            let scanner = this.btree.getScanner();
            while(scanner.hasNext()){
                let obj = scanner.next();
                let data = <AddressDescriptorUtxoData>(obj);

                ret = ret.addSelf(data.getTotalAmount());
            }

            return ret;
        }
        throw new NullPointerException("WalletAccountUtxoRepository.getTotalAmount()");
    }

    public getBalanceUtxo(utxoId : UtxoId) : BalanceUtxo|null {
        if(this.utxoIdBtree != null){
            let key = new UtxoIdKey(utxoId);
            let obj = this.utxoIdBtree.findByKey(key);

            let data = <AddressDescriptorData>(obj);
            if(data == null){
                return null;
            }

            let list = this.getBalanceUtxos(data.getDescriptor());

            let ret = null;

            let maxLoop = list != null ? list.size() : 0;
            for(let i = 0; i != maxLoop && list != null; ++i){
                let utxo = list.get(i);

                if(utxo != null){
                    let id = utxo.getId();

                    if(id.compareTo(utxoId) == 0){
                        ret = <BalanceUtxo>(utxo.copyData());
                        break;
                    }
                }
            }

            return ret;
        }
        throw new NullPointerException("WalletAccountUtxoRepository.getBalanceUtxo()");
    }

    public getBalanceUtxos(desc : AddressDescriptor) : ArrayList<BalanceUtxo>|null {
        if(this.btree != null){
            let key = new AddressDescriptorKey(desc);
            let obj = this.btree.findByKey(key);

            let data = <AddressDescriptorUtxoData>(obj);
            if(data == null){
                return null;
            }

            let list = new ArrayList<BalanceUtxo>();

            let l = data.getList();
            let maxLoop = l.size();
            for(let i = 0; i != maxLoop; ++i){
                let utxo = l.get(i);

                let butxo = <BalanceUtxo>(utxo);
                if(butxo != null){
                    list.addElement(<BalanceUtxo>(butxo.copyData()));
                }
            }

            return list;
        }
        throw new NullPointerException("WalletAccountUtxoRepository.getBalanceUtxos()");
    }

    public getUtxo(utxoId : UtxoId) : AbstractUtxo | null {
        if(this.utxoIdBtree != null){
            let key = new UtxoIdKey(utxoId);
            let obj = this.utxoIdBtree.findByKey(key);

            let data = <AddressDescriptorData>(obj);
            if(data == null){
                return null;
            }

            let list = this.getUtxos(data.getDescriptor());

            if(list != null){ // guard
                let ret = null;

                let maxLoop = list.size();
                for(let i = 0; i != maxLoop; ++i){
                    let utxo = list.get(i);

                    if(utxo != null){
                        let id = utxo.getId();

                        if(id.compareTo(utxoId) == 0){
                            ret = <AbstractUtxo>(utxo.copyData());
                            break;
                        }
                    }
                }

                return ret;
            }
        }
        throw new NullPointerException("WalletAccountUtxoRepository.getUtxo()");
    }

    public getUtxos(desc : AddressDescriptor) :  ArrayList<AbstractUtxo> | null {
        if(this.btree != null){
            let key = new AddressDescriptorKey(desc);
            let obj = this.btree.findByKey(key);

            let data = <AddressDescriptorUtxoData>(obj);
            if(data == null){
                return null;
            }

            let list : ArrayList<AbstractUtxo> = new ArrayList<AbstractUtxo>();

            let l = data.getList();
            let maxLoop = l.size();
            for(let i = 0; i != maxLoop; ++i){
                let utxo = l.get(i);

                if(utxo != null){
                    list.addElement(<AbstractUtxo>(utxo.copyData()));
                }
            }

            return list;
        }
        throw new NullPointerException("WalletAccountUtxoRepository.getUtxos()");
    }

    public getScanner() : BtreeScanner {
        if(this.utxoIdBtree != null){
            let scanner = this.utxoIdBtree.getScanner();
            return scanner;
        }
        throw new NullPointerException("WalletAccountUtxoRepository.getScanner()");
    }

}