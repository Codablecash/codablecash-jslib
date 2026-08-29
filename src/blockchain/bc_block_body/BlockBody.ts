import { ArrayList } from "../../db/base/ArrayList";
import { NullPointerException } from "../../db/base/NullPointerException";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { IBlockObject } from "../../db/filestore_block/IBlockObject";
import { AbstractSmartcontractTransaction } from "../../smartcontract_modular/transaction/AbstractSmartcontractTransaction";
import { BalanceUnit } from "../bc_base/BalanceUnit";
import { BlockMerkleRoot } from "../bc_block/BlockMerkleRoot";
import { AbstractBalanceTransaction } from "../bc_trx/AbstractBalanceTransaction";
import { AbstractBlockchainTransaction } from "../bc_trx/AbstractBlockchainTransaction";
import { AbstractControlTransaction } from "../bc_trx/AbstractControlTransaction";
import { AbstractInterChainCommunicationTansaction } from "../bc_trx/AbstractInterChainCommunicationTansaction";
import { TransactionId } from "../bc_trx/TransactionId";
import { MerkleTree } from "../merkletree/MerkleTree";
import { AbstractBlockRewordTransaction } from "./AbstractBlockRewordTransaction";
import { BlockRewordBase } from "./BlockRewordBase";

export class BlockBody implements IBlockObject {
    private tree : MerkleTree | null;
    private merkleRoot : BlockMerkleRoot | null;

    private nonce : bigint;
    
	private controlTransactions: ArrayList<AbstractControlTransaction>;
	private iccTransactions : ArrayList<AbstractInterChainCommunicationTansaction>;
	private balanceTransactions : ArrayList<AbstractBalanceTransaction>;
	private smartcontractTransactions : ArrayList<AbstractSmartcontractTransaction>;

    private rewardBase : BlockRewordBase;
    
    constructor(nonce? : bigint ){
        this.nonce = 0n;
        if(nonce != undefined){
            this.nonce = nonce;
        }
        
        this.tree = null;
        this.merkleRoot = null;
        this.balanceTransactions = new ArrayList<AbstractBalanceTransaction>();
        this.controlTransactions = new ArrayList<AbstractControlTransaction>();
        this.iccTransactions = new ArrayList<AbstractInterChainCommunicationTansaction>();
        this.smartcontractTransactions = new ArrayList<AbstractSmartcontractTransaction>();
        this.rewardBase = new BlockRewordBase();
    }

    public addBalanceTransaction(trx : AbstractBalanceTransaction) : void {
        this.balanceTransactions.addElement(<AbstractBalanceTransaction>(trx.copyData()));
    }

    public addControlTransaction(trx : AbstractControlTransaction)  {
        this.controlTransactions.addElement(<AbstractControlTransaction>(trx.copyData()));
    }

    public addInterChainCommunicationTransaction(trx : AbstractInterChainCommunicationTansaction) : void {
        this.iccTransactions.addElement(<AbstractInterChainCommunicationTansaction>(trx.copyData()));
    }

    public addSmartcontractTransaction(trx : AbstractSmartcontractTransaction) : void {
        this.smartcontractTransactions.addElement(<AbstractSmartcontractTransaction>(trx.copyData()));
    }

    public addBlockRewordTransaction(trx : AbstractBlockRewordTransaction) : void {
        this.rewardBase.addBlockRewordTransaction(trx);
    }

    public build() : void {
        this.resetMerkle();
        this.buildMerleTree();
    }

    public buildMerleTree() : void {
        this.tree = new MerkleTree();
        this.tree.addElement(this.nonce);
        
        if(this.tree != null){
            {
                let maxLoop = this.controlTransactions.size();
                for(let i = 0; i != maxLoop; ++i){
                    let trx = this.controlTransactions.get(i);
                    this.tree.addElement(trx);
                    trx?.addInternalMerkleTreeElement(this.tree);
                }
            }
            {
                let maxLoop = this.iccTransactions.size();
                for(let i = 0; i != maxLoop; ++i){
                    let trx = this.iccTransactions.get(i);
                    this.tree.addElement(trx);
                    trx?.addInternalMerkleTreeElement(this.tree);
                }
            }
            {
                let maxLoop = this.balanceTransactions.size();
                for(let i = 0; i != maxLoop; ++i){
                    let trx = this.balanceTransactions.get(i);
                    this.tree.addElement(trx);
                    trx?.addInternalMerkleTreeElement(this.tree);
                }
            }
            {
                let maxLoop = this.smartcontractTransactions.size();
                for(let i = 0; i != maxLoop; ++i){
                    let trx = this.smartcontractTransactions.get(i);
                    this.tree.addElement(trx);
                    trx?.addInternalMerkleTreeElement(this.tree);
                }
            }

            this.rewardBase.buildMerkleTree(this.tree);

            this.tree.pack();
            let element = this.tree.getRoot();

            let buff = element.getHash();
            this.merkleRoot = new BlockMerkleRoot(buff.toUint8Array(), buff.limit());
        }
    }

    public binarySize() : number {
        let total = 8; // sizeof(this.nonce);

        {
            let maxLoop = this.controlTransactions.size();
            //BinaryUtils::checkUShortRange(maxLoop, 0, MAX_CONTROL_TRX);
            total += 2; // sizeof(uint16_t);

            for(let i = 0; i != maxLoop; ++i){
                let trx = this.controlTransactions.get(i);
                if(trx != null){
                    total += trx.binarySize();
                }
            }
        }

        {
            let maxLoop = this.iccTransactions.size();
            //BinaryUtils::checkUShortRange(maxLoop, 0, MAX_ICC_TRX);
            total += 2; // sizeof(uint16_t);

            for(let i = 0; i != maxLoop; ++i){
                let trx = this.iccTransactions.get(i);
                if(trx != null){
                    total += trx.binarySize();
                }
            }
        }

        {
            let maxLoop = this.balanceTransactions.size();
            //BinaryUtils::checkUShortRange(maxLoop, 0, MAX_BALANCE_TRX);
            total += 2; //sizeof(uint16_t);

            for(let i = 0; i != maxLoop; ++i){
                let trx = this.balanceTransactions.get(i);
                if(trx != null){
                    total += trx.binarySize();
                }
            }
        }

        {
            let maxLoop = this.smartcontractTransactions.size();
            //BinaryUtils::checkUShortRange(maxLoop, 0, MAX_SMARTCONTRACT_TRX);
            total += 2; // sizeof(uint16_t);

            for(let i = 0; i != maxLoop; ++i){
                let trx = this.smartcontractTransactions.get(i);
                if(trx != null){
                    total += trx.binarySize();
                }
            }
        }

        total += this.rewardBase.binarySize();

        return total;
    }

    public toBinary(out : ByteBuffer) : void {
        out.putLong(this.nonce);

        {
            let maxLoop = this.controlTransactions.size();
            //BinaryUtils::checkUShortRange(maxLoop, 0, MAX_CONTROL_TRX);
            out.putShort(maxLoop);

            for(let i = 0; i != maxLoop; ++i){
                let trx = this.controlTransactions.get(i);
                trx?.toBinary(out);
            }
        }

        {
            let maxLoop = this.iccTransactions.size();
            //BinaryUtils::checkUShortRange(maxLoop, 0, MAX_ICC_TRX);
            out.putShort(maxLoop);

            for(let i = 0; i != maxLoop; ++i){
                let trx = this.iccTransactions.get(i);
                trx?.toBinary(out);
            }
        }

        {
            let maxLoop = this.balanceTransactions.size();
            // BinaryUtils::checkUShortRange(maxLoop, 0, MAX_BALANCE_TRX);
            out.putShort(maxLoop);

            for(let i = 0; i != maxLoop; ++i){
                let trx = this.balanceTransactions.get(i);
                trx?.toBinary(out);
            }
        }

        {
            let maxLoop = this.smartcontractTransactions.size();
            // BinaryUtils::checkUShortRange(maxLoop, 0, MAX_SMARTCONTRACT_TRX);
            out.putShort(maxLoop);

            for(let i = 0; i != maxLoop; ++i){
                let trx = this.smartcontractTransactions.get(i);
                trx?.toBinary(out);
            }
        }

        this.rewardBase.toBinary(out);
    }

    public static fromBinary(input : ByteBuffer) : BlockBody {
        let body = new BlockBody(0n);

        body.nonce = input.getLong();

        {
            let maxLoop = input.getShort();
            //BinaryUtils::checkUShortRange(maxLoop, 0, MAX_CONTROL_TRX);

            for(let i = 0; i != maxLoop; ++i){
                let trx = AbstractBalanceTransaction.createFromBinary(input);
                let ctrx = <AbstractControlTransaction>(trx);

                body.addControlTransaction(ctrx);
            }
        }

        {
            let maxLoop = input.getShort();
            //BinaryUtils::checkUShortRange(maxLoop, 0, MAX_ICC_TRX);

            for(let i = 0; i != maxLoop; ++i){
                let trx = AbstractBalanceTransaction.createFromBinary(input);
                let icctrx = <AbstractInterChainCommunicationTansaction>(trx);
                //BinaryUtils::checkNotNull(icctrx);

                body.addInterChainCommunicationTransaction(icctrx);
            }
        }

        {
            let maxLoop = input.getShort();
            //BinaryUtils::checkUShortRange(maxLoop, 0, MAX_BALANCE_TRX);

            for(let i = 0; i != maxLoop; ++i){
                let trx = AbstractBalanceTransaction.createFromBinary(input);
                let btrx = <AbstractBalanceTransaction>(trx);
                //BinaryUtils::checkNotNull(btrx);

                body.addBalanceTransaction(btrx);
            }
        }

        {
            let maxLoop = input.getShort();
            //BinaryUtils::checkUShortRange(maxLoop, 0, MAX_SMARTCONTRACT_TRX);

            for(let i = 0; i != maxLoop; ++i){
                let trx = AbstractBalanceTransaction.createFromBinary(input);
                let sctrx = <AbstractSmartcontractTransaction>(trx);

                body.addSmartcontractTransaction(sctrx);
            }
        }

        body.rewardBase = BlockRewordBase.createFromBinary(input);
        //BinaryUtils::checkNotNull(body.rewardBase);

        body.build();

        return body;
    }

    public copyData() : IBlockObject {
        let body = new BlockBody(0n);

        body.nonce = this.nonce;

        {
            let maxLoop = this.controlTransactions.size();
            for(let i = 0; i != maxLoop; ++i){
                let trx = this.controlTransactions.get(i);
                if(trx != null){
                    body.addControlTransaction(trx);
                }
            }
        }
        {
            let maxLoop = this.iccTransactions.size();
            for(let i = 0; i != maxLoop; ++i){
                let trx = this.iccTransactions.get(i);
                if(trx != null){
                    body.addInterChainCommunicationTransaction(trx);
                }
            }
        }
        {
            let maxLoop = this.balanceTransactions.size();
            for(let i = 0; i != maxLoop; ++i){
                let trx = this.balanceTransactions.get(i);
                if(trx != null){
                    body.addBalanceTransaction(trx);
                }
            }
        }
        {
            let maxLoop = this.smartcontractTransactions.size();
            for(let i = 0; i != maxLoop; ++i){
                let trx = this.smartcontractTransactions.get(i);
                if(trx != null){
                    body.addSmartcontractTransaction(trx);
                }
            }
        }

        // copy reword base
        body.rewardBase = this.rewardBase.copy();

        body.build();

        return body;
    }

    public getTotalFee() : BalanceUnit {
        let fee = new BalanceUnit(0);
        {
            let maxLoop = this.balanceTransactions.size();
            for(let i = 0; i != maxLoop; ++i){
                let trx = this.balanceTransactions.get(i);
                if(trx != null){
                    fee.addSelf(trx.getFee());
                }
            }
        }
        {
            let maxLoop = this.iccTransactions.size();
            for(let i = 0; i != maxLoop; ++i){
                let trx = this.iccTransactions.get(i);
                if(trx != null){
                    fee.addSelf(trx.getFee());
                }
            }
        }
        {
            let maxLoop = this.controlTransactions.size();
            for(let i = 0; i != maxLoop; ++i){
                let trx = this.controlTransactions.get(i);
                if(trx != null){
                    fee.addSelf(trx.getFee());
                }
            }
        }
        {
            let maxLoop = this.smartcontractTransactions.size();
            for(let i = 0; i != maxLoop; ++i){
                let trx = this.smartcontractTransactions.get(i);
                if(trx != null){
                    fee.addSelf(trx.getFee());
                }
            }
        }

        return fee;
    }

    public getControlTransaction(trxId : TransactionId) : AbstractBlockchainTransaction {
        let maxLoop = this.controlTransactions.size();
        for(let i = 0; i != maxLoop; ++i){
            let trx = this.controlTransactions.get(i);

            if(trx != null && trxId.equals(trx.getTransactionId())){
                return trx;
            }
        }

        throw new NullPointerException("BlockBody.getControlTransaction()");
    }

    public getBalanceTransaction(trxId : TransactionId) : AbstractBalanceTransaction {
        let maxLoop = this.balanceTransactions.size();
        for(let i = 0; i != maxLoop; ++i){
            let trx = this.balanceTransactions.get(i);

            if(trx != null && trxId.equals(trx.getTransactionId())){
                return trx;
            }
        }

        throw new NullPointerException("BlockBody.getBalanceTransaction()");
    }

    public getInterChainCommunicationTansaction(trxId : TransactionId) : AbstractInterChainCommunicationTansaction {
        let maxLoop = this.iccTransactions.size();
        for(let i = 0; i != maxLoop; ++i){
            let trx = this.iccTransactions.get(i);

            if(trx != null && trxId.equals(trx.getTransactionId())){
                return trx;
            }
        }

        throw new NullPointerException("BlockBody.getInterChainCommunicationTansaction()");
    }

    public getSmartcontractTransaction(trxId : TransactionId) : AbstractSmartcontractTransaction {
        let maxLoop = this.smartcontractTransactions.size();
        for(let i = 0; i != maxLoop; ++i){
            let trx = this.smartcontractTransactions.get(i);

            if(trx != null && trxId.equals(trx.getTransactionId())){
                return trx;
            }
        }

        throw new NullPointerException("BlockBody.getSmartcontractTransaction()");
    }

    public resetMerkle() : void {
        this.merkleRoot = null;
        this.tree = null;
    }
}