import { CFile } from "../../../db/base_io/CFile";
import { Os } from "../../../db/osenv/Os";

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

describe('OsFileTest', () => {
    it('case01', async () => {
        let projectFolder = new CFile("out/OsFileTest/case01");
        projectFolder.deleteDir();
        projectFolder.mkdirs();

        let name = "out.bin";
        let outFile = projectFolder.get(name);
        
        {
            let fd = Os.openFile2ReadWrite(outFile, false);
            let data = makeTestData(1, 32);

            let n = await Os.write2File(fd, data, 32);

            expect(n).toBe(32);

            Os.closeFileDescriptor(fd);
        }

        {
            let fd = Os.openFile2ReadWrite(outFile, false);
            let data = new Uint8Array(32);
            let n = await Os.readFile(fd, data, 32);

            checkTestData(1, data, 32);

            expect(n).toBe(32);
        }
        
    })

    it('case02', async () => {
        let projectFolder = new CFile("out/OsFileTest/case02");
        projectFolder.deleteDir();
        projectFolder.mkdirs();

        let name = "out.bin";
        let outFile = projectFolder.get(name);
        
        let datalen = 16384;
        {
            let fd = Os.openFile2ReadWrite(outFile, false);
            let data = makeTestData(1, datalen);

            let n = await Os.write2File(fd, data, datalen);

            expect(n).toBe(datalen);

            Os.closeFileDescriptor(fd);
        }

        {
            let fd = Os.openFile2ReadWrite(outFile, false);
            let data = new Uint8Array(datalen);
            let n = await Os.readFile(fd, data, datalen);

            checkTestData(1, data, datalen);

            expect(n).toBe(datalen);
        }
        
    })
});