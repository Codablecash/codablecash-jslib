import { AbstractBlockchainTransaction } from "../../blockchain/bc_trx/AbstractBlockchainTransaction";
import { NullPointerException } from "../../db/base/NullPointerException";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";
import { TransferedDataId } from "../data_history/TransferedDataId";
import { AbstractTransferedData } from "./AbstractTransferedData";

export class TransactionTransferData extends AbstractTransferedData {
    private trx : AbstractBlockchainTransaction | null;

    constructor() {
        super(AbstractTransferedData.DATA_TRANSACTION)
        this.trx = null;
    }

    public binarySize() : number {
        if(this.trx != null){
            let total = 1; // sizeof(uint8_t);
            total += this.trx.binarySize();

            return total;
        }
        throw new NullPointerException("TransactionTransferData.binarySize()");
    }

    public toBinary(out : ByteBuffer) : void {
        if(this.trx != null){
            out.put(this.type);
            this.trx.toBinary(out);
        }
        throw new NullPointerException("TransactionTransferData.toBinary()");
    }

    public fromBinary(input : ByteBuffer) {
        this.trx = AbstractBlockchainTransaction.createFromBinary(input);
    }

    public copyData() : IBlockObject {
        if(this.trx != null){
            let inst = new TransactionTransferData();
            inst.setTransaction(this.trx);
            return inst;
        }
        throw new NullPointerException("TransactionTransferData.copyData()");
    }

    public setTransaction(trx : AbstractBlockchainTransaction) : void {
        this.trx = <AbstractBlockchainTransaction>(trx.copyData());
    }
    public getTransaction() : AbstractBlockchainTransaction {
        if(this.trx != null) {
            return this.trx;
        }
        throw new NullPointerException("TransactionTransferData.getTransaction()");
    }

    public getTransferedDataId() : TransferedDataId {
        if(this.trx != null){
            let id = this.trx.getTransactionId();

            let dataId = new TransferedDataId(id.toArray(), id.size());
            return dataId;
        }
        throw new NullPointerException("TransactionTransferData.getTransferedDataId()");
    }
}