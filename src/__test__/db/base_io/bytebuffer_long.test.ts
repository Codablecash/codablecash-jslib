import { ByteBuffer } from "../../../db/base_io/ByteBuffer"


describe('BytebufferLongTest', () => {
    it('longTest', () => {
        let buff = ByteBuffer.allocateWithEndian(32, true);

        let num : number = 4096;
        let num2 : number = 123456;

        buff.putLong(num);
        buff.putLong(num2);
        buff.position(0);

        let bint = buff.getLong();
        let v = Number(bint);
        expect(num == v).toBe(true);

        bint = buff.getLong();
        v = Number(bint);
        expect(num2 == v).toBe(true);
    })
})