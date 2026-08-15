

function makeTestData(start : number, length : number) {
	let ptr = new Uint8Array(length);

	for(let i = 0; i != length; ++i){
		let ch = start % 128;
		start++;

		ptr[i] = ch;
	}
	return ptr;
}

function checkTestData(start : number, data : Uint8Array, length: number) {
	for(let i = 0; i != length; ++i){
		let ch = start % 128;
		start++;

		if(data[i] != ch){
			return false;
		}
	}
	return true;
}

describe('TestVariableBlockFileStoreGroup', () => {
    it('addSimpleRange', () => {

    })

})