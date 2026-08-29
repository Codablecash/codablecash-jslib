import { Base58 } from "../../../blockchain/bc_base/Base58";
import { ByteBuffer } from "../../../db/base_io/ByteBuffer";

function makeData(){
	let data = ByteBuffer.allocateWithEndian(8, true);
	
	data.putLong(3471844090);
	data.position(0);

	let result = ByteBuffer.allocateWithEndian(8, true);

	let ch = data.get();
	ch = data.get();
	ch = data.get();
	ch = data.get(); result.put(ch);
	ch = data.get(); result.put(ch);
	ch = data.get(); result.put(ch);
	ch = data.get(); result.put(ch);
	ch = data.get(); result.put(ch);

	return result;
}

describe('TestBase58Group', () => {
    it('encode', () => {
        let instr = "Hello World";
        let buff = Buffer.from(instr);
        let binsize = 11;

        let str = Base58.encode(buff, binsize);

        let ans = "JxF12TrwUP45BMd";
        expect(str === ans).toBe(true);
    })

    it('TestBase58Group', () => {
        let data = makeData();

        let binsize = data.getPosition();
        data.position(0);
        let buff : Uint8Array = data.toUint8Array().slice(0, binsize);

        let str = Base58.encode(buff, binsize);

        let ans ="16Ho7Hs";
        expect(str === ans).toBe(true);

        let decoded = Base58.decode(ans);
        let pos = decoded?.getPosition();
        expect(pos == binsize);

        decoded?.position(0);
        let buff2 = decoded?.toUint8Array();

        expect(buff.length == buff2?.length).toBe(true);
    })

})
