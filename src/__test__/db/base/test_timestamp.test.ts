import { SystemTimestamp } from "../../../db/base_timestamp/SystemTimestamp"


describe('TestTimestampGroup', () => {
    it('case01', () =>{
        let tm = new SystemTimestamp();

        let date = tm.getDate();
        let str = date.toDateString();
    })
})