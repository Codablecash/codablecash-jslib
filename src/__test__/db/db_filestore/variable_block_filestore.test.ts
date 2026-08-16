import { CFile } from "../../../db/base_io/CFile";
import { VariableBlockFileStore } from "../../../db/filestore_variable_block/VariableBlockFileStore";
import { DiskCacheManager } from "../../../db/random_access_file/DiskCacheManager";


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
    it('case01', async () => {
		let projectFolder = new CFile("out/random_access_file/case01");
		projectFolder.deleteDir();
		projectFolder.mkdirs();

		let baseDirStr = projectFolder.getAbsolutePath();

		let cacheManager = new DiskCacheManager();
		let name = "file01";

		let store = new VariableBlockFileStore(baseDirStr, name, cacheManager);

		await store.createStore(true, 256, 32);
    })

})