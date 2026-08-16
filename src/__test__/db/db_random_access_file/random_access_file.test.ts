import { CFile } from "../../../db/base_io/CFile";
import { Os } from "../../../db/osenv/Os";
import { DiskCacheManager } from "../../../db/random_access_file/DiskCacheManager";
import { RandomAccessFile } from "../../../db/random_access_file/RandomAccessFile";

function makeTestData(start : number, length : number) : Uint8Array{
	let ptr = new Uint8Array(length);

	for(let i = 0; i != length; ++i){
		let ch = start % 128;
		start++;

		ptr[i] = ch;
	}
	return ptr;
}

function checkTestData(start : number, data : Uint8Array, length: number) {
	for(let i = 0; i != length; ++i){
		let ch = start % 128;
		start++;

		if(data[i] != ch){
			return false;
		}
	}
	return true;
}

describe('RAFTestGroup', () => {
/*    it('construct', async () => {
        let projectFolder = new CFile("out/random_access_file/construct");
        projectFolder.deleteDir();
        projectFolder.mkdirs();

        let name = "out.bin";
        let outFile = projectFolder.get(name);

        let file = new RandomAccessFile(outFile, new DiskCacheManager());
        await file.open(false);

        file.close();
    })

    it('case01', async () =>{
        let projectFolder = new CFile("out/random_access_file/case01");
        projectFolder.deleteDir();
        projectFolder.mkdirs();

        let name = "out.bin";
        let outFile = projectFolder.get(name);

        let file = new RandomAccessFile(outFile, new DiskCacheManager());
        file.open(false);

        file.setLength(file.getSegmentSize() + 128);

        file.close();
    })
*/
    it('case02', async () =>{
        let projectFolder = new CFile("out/random_access_file/case02");
        projectFolder.deleteDir();
        projectFolder.mkdirs();

        let name = "out.bin";
        let outFile = projectFolder.get(name);

        {
            let file = new RandomAccessFile(outFile, new DiskCacheManager());
            file.open(false);

            let data = makeTestData(1, 10);

            file.write(0, data, data.length);

            let result = new Uint8Array(10);
            file.read(0, result, 10);

            file.close();
        }

        {
            let fd = Os.openFile2ReadWrite(outFile, false);
            let data = new Uint8Array(10);
            let n = Os.readFile(fd, data, 10);

            expect(n).toBe(10);
        }

        {
            let file = new RandomAccessFile(outFile, new DiskCacheManager());
            file.open(false);

            let result = new Uint8Array(10);
            file.read(0, result, 10);

            file.close();
        }

    })
})
