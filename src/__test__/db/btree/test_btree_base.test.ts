import { CFile } from "../../../db/base_io/CFile";
import { Btree, BtreeOpenConfig } from "../../../db/btree/Btree";
import { BtreeConfig } from "../../../db/btree/BtreeConfig";
import { BtreeKeyFactory } from "../../../db/btreekey/BtreeKeyFactory";
import { InfinityKey } from "../../../db/btreekey/InfinityKey"
import { NullKey } from "../../../db/btreekey/NullKey";
import { ULongKey } from "../../../db/btreekey/ULongKey";
import { DiskCacheManager } from "../../../db/random_access_file/DiskCacheManager";
import { TmpValueFactory } from "./TempValue";

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
})
