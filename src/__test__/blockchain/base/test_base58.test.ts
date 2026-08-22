import { Base58 } from "../../../blockchain/bc_base/Base58";

describe('TestBase58Group', () => {
    it('encode', () => {
        let instr = "Hello World";
        let buff = Buffer.from(instr);
        let binsize = 11;

        let str = Base58.encode(buff, binsize);

        let ans = "JxF12TrwUP45BMd";
        expect(str === ans).toBe(true);
    })

})
