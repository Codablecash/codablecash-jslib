

function akeTestData(start : number, length : number) {
	let ptr = new Uint8Array(length);

	for(let i = 0; i != length; ++i){
		let ch = start % 128;
		start++;

		ptr[i] = ch;
	}
	return ptr;
}

describe('TestVariableBlockFileStoreGroup', () => {
    it('addSimpleRange', () => {

    })

})