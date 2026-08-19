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

    it('add01', () => {
        let projectFolder = new CFile("out/btree/add01");
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

        {
            let lkey = new ULongKey(7);

            let scanner = btree.getScanner();

            scanner.begin(lkey);
            let i = 3;
            while(scanner.hasNext()){
                let obj = scanner.next();
                let k = scanner.nextKey();

                let tmp = <TempValue>(obj);
                let v = tmp.getValue();

                let lk = <ULongKey>(k);
                let kv = Number(lk.getValue());

                let a = answers.get(i++);
                expect(v == a).toBe(true);
                expect(kv == a).toBe(true);
            }
        }
        {
            let lkey = new ULongKey(6);

            let scanner = btree.getScanner();

            scanner.begin(lkey);
            let i = 2;
            while(scanner.hasNext()){
                let obj = scanner.next();
                let k = scanner.nextKey();

                let tmp = <TempValue>(obj);
                let v = tmp.getValue();

                let lk = <ULongKey>(k);
                let kv = Number(lk.getValue());

                let a = answers.get(i++);
                expect(v == a).toBe(true);
                expect(kv == a).toBe(true);
            }
        }
        {
            let lkey = new ULongKey(1000);

            let scanner = btree.getScanner();

            scanner.begin(lkey);
            expect(scanner.hasNext() == false).toBe(true);
        }

        {
            let lkey = new ULongKey(6);
            let obj = btree.findByKey(lkey);
            let tmp = <TempValue>(obj);
            let v = tmp.getValue();
            expect(v == 6).toBe(true);

            let lkey2 = new ULongKey(7);
            obj = btree.findByKey(lkey2);
            expect(obj == null).toBe(true);
        }

        btree.close();
    })

    it('add02', () => {
        let projectFolder = new CFile("out/btree/add02");
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
        config.nodeNumber = 3;
        btree.create(config);

        let opconf = new BtreeOpenConfig();
        btree.open(opconf);

        let answers = new RawArrayPrimitive<number>(32);
        {
            addKeyValue(10, 10, btree);
            addKeyValue(6, 6, btree);
            addKeyValue(6, 6, btree);

            addKeyValue(3, 3, btree);
            addKeyValue(2, 2, btree);
            addKeyValue(100, 100, btree);
            addKeyValue(50, 50, btree);
            addKeyValue(7, 7, btree);
            addKeyValue(8, 8, btree);
            addKeyValue(9, 9, btree);
            addKeyValue(11, 11, btree);
            addKeyValue(12, 12, btree);
            addKeyValue(13, 13, btree);
            addKeyValue(14, 14, btree);


            answers.addElement(2);
            answers.addElement(3);
            answers.addElement(6);
            answers.addElement(7);
            answers.addElement(8);
            answers.addElement(9);
            answers.addElement(10);
            answers.addElement(11);
            answers.addElement(12);
            answers.addElement(13);
            answers.addElement(14);
            answers.addElement(50);
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

    it('remove01', () => {
        let projectFolder = new CFile("out/btree/remove01");
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
        config.nodeNumber = 3;
        btree.create(config);

        let opconf = new BtreeOpenConfig();
        btree.open(opconf);

        let answers = new RawArrayPrimitive<number>(32);
        {
            addKeyValue(10, 10, btree);
            addKeyValue(6, 6, btree);
            addKeyValue(3, 3, btree);
            addKeyValue(2, 2, btree);
            addKeyValue(100, 100, btree);
            addKeyValue(50, 50, btree);
            addKeyValue(7, 7, btree);
            addKeyValue(8, 8, btree);
            addKeyValue(9, 9, btree);
            addKeyValue(11, 11, btree);
            addKeyValue(12, 12, btree);
            addKeyValue(13, 13, btree);
            addKeyValue(14, 14, btree);

            answers.addElement(2);
            answers.addElement(3);
            answers.addElement(6);
            //answers.addElement(7);
            //answers.addElement(8);
            //answers.addElement(9);
            //answers.addElement(10);
            answers.addElement(11);
            answers.addElement(12);
            answers.addElement(13);
            answers.addElement(14);
            answers.addElement(50);
            answers.addElement(100);
        }

		{
			let lkey = new ULongKey(7);
			btree.remove(lkey);
		}
		{
			let lkey = new ULongKey(7000);
			btree.remove(lkey);
		}
		{
			let lkey8 = new ULongKey(8);
			btree.remove(lkey8);
			let lkey9 = new ULongKey(9);
			btree.remove(lkey9);
			let lkey10 = new ULongKey(10);
			btree.remove(lkey10);
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
