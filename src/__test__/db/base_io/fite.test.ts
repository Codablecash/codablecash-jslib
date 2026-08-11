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
})
