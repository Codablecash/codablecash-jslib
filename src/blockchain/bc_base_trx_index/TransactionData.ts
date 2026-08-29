import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";
import { AbstractBlockchainTransaction } from "../bc_trx/AbstractBlockchainTransaction";

export class TransactionData implements IBlockObject {
    private trx : AbstractBlockchainTransaction;

    constructor(trx : AbstractBlockchainTransaction){
        this.trx = <AbstractBlockchainTransaction>trx.copyData();
    }

	public getTrx() : AbstractBlockchainTransaction {
		return this.trx;
	}

    public binarySize() : number {
        let total = this.trx.binarySize();

        return total;
    }

    public toBinary(out : ByteBuffer) : void {
        this.trx.toBinary(out);
    }

    public static fromBinary(input : ByteBuffer) : TransactionData {
        let trx = AbstractBlockchainTransaction.createFromBinary(input);

        return new TransactionData(trx);
    }

    public copyData() : IBlockObject {
        return new TransactionData(this.trx);
    }    
}