import { IComparable } from "../../../db/base/IComparable";
import { SystemTimestamp } from "../../../db/base_timestamp/SystemTimestamp"


function testcast(tm1 : IComparable | null ) {
    let o = <SystemTimestamp>tm1;

    return o == null;
};

describe('TestTimestampGroup', () => {
    it('case01', () =>{
        let tm = new SystemTimestamp();

        let date = tm.getDate();
        let str = date.toDateString();

        let tm1 = testcast(null);
    })
    
})

