import { SysMutex } from "../../../db/base_thread/SysMutex"


describe('SysMutex test', () => {
    it('mod inverse', () => {
        let lock = new SysMutex();

        let i : number = 1;

        lock.acqire(() => {
            i++;
        });

         expect(i).toBe(2);
    })
})

