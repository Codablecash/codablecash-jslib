import { CFile } from "../../../db/base_io/CFile";
import { DiskCacheManager } from "../../../db/random_access_file/DiskCacheManager";
import { RandomAccessFile } from "../../../db/random_access_file/RandomAccessFile";

describe('Random Access File test', () => {
    it('construct', async () => {
        let projectFolder = new CFile("out/random_access_file/construct");
        projectFolder.deleteDir();
        projectFolder.mkdirs();

        let name = "out.bin";
        let outFile = projectFolder.get(name);

        let file = new RandomAccessFile(outFile, new DiskCacheManager());
        await file.open(false);

        await file.close();
    })
})
