

export abstract class AbstractTransferedData {
	public static  DATA_TRANSACTION = 1;
	public static  DATA_BLOCKHEADER = 2;
	public static  DATA_CLIENT_BLOCKHEADER = 3;
	public static  DATA_BLOCK_TRANSACTION = 4;

	public static  DATA_LIVEDATA = 10;

    private type : number;

    constructor(type : number){
        this.type = type;
    }
}