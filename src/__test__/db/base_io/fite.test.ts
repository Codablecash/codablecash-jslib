import { CFile } from "../../../db/base_io/CFile";



describe('File test', () => {
    it('resolve path', () => {
        let f = new CFile("a.txt");
        let abs = f.getAbsolutePath();

        let bl = f.isAbsolute();
        expect(bl).toBe(false);

        let absFile = new CFile(abs);
        bl = absFile.isAbsolute();
        expect(bl).toBe(true);
    })

    it('mkdirs', () => {
        let testDir = new CFile("out/file/mkdirs");

        testDir.deleteDir();

        let bl = testDir.mkdirs();
        expect(bl).toBe(true);

        bl = testDir.mkdirs();
        expect(bl).toBe(false);

        bl =  testDir.deleteDir();
        expect(bl).toBe(true);

        bl =  testDir.deleteDir();
        expect(bl).toBe(false);
    })

    it('get', () => {
        let testDir = new CFile("out/file/get");

        let newPath = testDir.get("base.bin");

        let str = newPath.toString();
        expect(str).toBe("out/file/get/base.bin");
    })

})
