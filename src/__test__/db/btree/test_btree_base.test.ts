import { RawArrayPrimitive } from "../../../db/base/RawArrayPrimitive";
import { CFile } from "../../../db/base_io/CFile";
import { Btree, BtreeOpenConfig } from "../../../db/btree/Btree";
import { BtreeConfig } from "../../../db/btree/BtreeConfig";
import { BtreeKeyFactory } from "../../../db/btreekey/BtreeKeyFactory";
import { InfinityKey } from "../../../db/btreekey/InfinityKey"
import { NullKey } from "../../../db/btreekey/NullKey";
import { ULongKey } from "../../../db/btreekey/ULongKey";
import { DiskCacheManager } from "../../../db/random_access_file/DiskCacheManager";


import { TempValue, TmpValueFactory } from "./TempValue";


function addKeyValue(key : number, value: number, btree : Btree){
	let lkey = new ULongKey(key);
	let tvalue = new TempValue(value);

	btree.putData(lkey, tvalue);
}

describe('TestBTreeGroup', () => {
    it('infinityKey', () => {
        let key = new InfinityKey();
        let key2 = <InfinityKey>key.clone();
        let ulkey = new ULongKey(100);

        expect(key.compareTo(key2)).toBe(0);
        expect(key.compareTo(ulkey) > 0).toBe(true);
        expect(ulkey.compareTo(key) < 0).toBe(true);

        expect(!key.isNull()).toBe(true);
        expect(!ulkey.isNull()).toBe(true);
    })

    it('nullkey', () => {
        let key = new NullKey();
        let key2 = <NullKey>key.clone();
        let ulkey = new ULongKey(100);

        expect(key.compareTo(key2)).toBe(0);
        expect(key.compareTo(ulkey) < 0).toBe(true);
        expect(ulkey.compareTo(key) > 0).toBe(true);
    })

    it('open', () => {
        let projectFolder = new CFile("out/btree/open");
        projectFolder.deleteDir();
        projectFolder.mkdirs();

        let baseDir = projectFolder.get("store");
        let baseDirStr = baseDir.getAbsolutePath();

        let cacheManager = new DiskCacheManager();
        let name = "file01";

        let factory = new BtreeKeyFactory();
        let dfactory = new TmpValueFactory();

        let btree = new Btree(baseDir, name, cacheManager, factory, dfactory);

        let  config = new BtreeConfig();
        btree.create(config);

        let opconf = new BtreeOpenConfig();
        btree.open(opconf);
        btree.close();
    })

    it('ScanEmpty', () => {
        let projectFolder = new CFile("out/btree/ScanEmpty");
        projectFolder.deleteDir();
        projectFolder.mkdirs();
        let baseDir = projectFolder.get("store");
        let baseDirStr = baseDir.getAbsolutePath();

        let cacheManager = new DiskCacheManager();
        let name = "file01";

        let factory = new BtreeKeyFactory();
        let dfactory = new TmpValueFactory();

        let btree = new Btree(baseDir, name, cacheManager, factory, dfactory);
        let  config = new BtreeConfig();
        btree.create(config);

        let opconf = new BtreeOpenConfig();
        btree.open(opconf);
        {
            let scanner = btree.getScanner();

            scanner.begin();

            while(scanner.hasNext()){
                let k = scanner.nextKey();
                let obj = scanner.next();
            }
        }
        btree.close();
    })

    it('ScanEmpty', () => {
        let projectFolder = new CFile("out/btree/ScanEmpty");
        projectFolder.deleteDir();
        projectFolder.mkdirs();
        let baseDir = projectFolder.get("store");
        let baseDirStr = baseDir.getAbsolutePath();

        let cacheManager = new DiskCacheManager();
        let name = "file01";

        let factory = new BtreeKeyFactory();
        let dfactory = new TmpValueFactory();

        let btree = new Btree(baseDir, name, cacheManager, factory, dfactory);
        let  config = new BtreeConfig();
        config.nodeNumber = 2;
        btree.create(config);

        let opconf = new BtreeOpenConfig();
        btree.open(opconf);

        let answers = new RawArrayPrimitive<number>();
        {
            addKeyValue(10, 10, btree);
            addKeyValue(6, 6, btree);
            addKeyValue(6, 6, btree);

            addKeyValue(3, 3, btree);
            addKeyValue(2, 2, btree);
            addKeyValue(100, 100, btree);

            answers.addElement(2);
            answers.addElement(3);
            answers.addElement(6);
            //answers.addElement(6);
            answers.addElement(10);
            answers.addElement(100);
        }

        {
            let scanner = btree.getScanner();

            scanner.begin();
            let i = 0;
            while(scanner.hasNext()){
                let k = scanner.nextKey();
                let obj = scanner.next();


                let tmp = <TempValue>(obj);
                let v = tmp.getValue();

                let lk = <ULongKey>(k);
                let kv = Number(lk.getValue());

                let a = answers.get(i++);
                expect(v == a).toBe(true);
                expect(kv == a).toBe(true);
            }
        }

        btree.close();
    })
})
