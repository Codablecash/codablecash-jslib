import { Base64 } from "../../../blockchain/bc_base/Base64";


describe('TestBase64Group', () => {
    it('case01', () => {
        let __data : number[] = [1, 2, 3 ,4, 5, 100, 200, 134, 156];
        let data : Uint8Array = Uint8Array.from(__data);


        let enc = Base64.encode(data, data.length);


        let encIn = Buffer.from(enc, "utf8");
        let buff = Base64.decode(encIn, encIn.length);

        let res : Uint8Array = buff.toUint8Array();

        expect(res.length == data.length).toBe(true);
        for(let i = 0; i != res.length; ++i){
            expect(res[i] == data[i]).toBe(true);  
        }
    })
})