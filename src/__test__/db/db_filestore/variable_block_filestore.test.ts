import { CFile } from "../../../db/base_io/CFile";
import { IBlockHandle } from "../../../db/filestore_block/IBlockHandle";
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
/*
    it('case01', async () => {
		let projectFolder = new CFile("out/random_access_file/case01");
		projectFolder.deleteDir();
		projectFolder.mkdirs();

		let baseDirStr = projectFolder.getAbsolutePath();

		let cacheManager = new DiskCacheManager();
		let name = "file01";

		let store = new VariableBlockFileStore(baseDirStr, name, cacheManager);

		store.createStore(true, 256, 32);
    })
*/
	it('case02', () => {
		let projectFolder = new CFile("out/random_access_file/case02");
		projectFolder.deleteDir();
		projectFolder.mkdirs();

		let baseDirStr = projectFolder.getAbsolutePath();

		let cacheManager = new DiskCacheManager();
		let name = "file01";

		{
			let store = new VariableBlockFileStore(baseDirStr, name, cacheManager);
			store.createStore(true, 256, 32);
		}

		{
			let store = new VariableBlockFileStore(baseDirStr, name, cacheManager);
			store.open(false);

			store.close();
		}
	})
/*
	it('alloc01', () => {
		let projectFolder = new CFile("out/random_access_file/alloc01");
		projectFolder.deleteDir();
		projectFolder.mkdirs();

		let baseDirStr = projectFolder.getAbsolutePath();

		let cacheManager = new DiskCacheManager();
		let name = "file01";
	
		{
			let store = new VariableBlockFileStore(baseDirStr, name, cacheManager);
			store.createStore(true, 256, 32);
		}

		let fpos;
		{
			let store = new VariableBlockFileStore(baseDirStr, name, cacheManager);
			store.open(false);

			let data = makeTestData(3, 10);

			let handle = store.alloc(10);
			handle.write(data, 10);

			fpos = handle.getFpos();

			store.close();
		}
	})

	*/
})