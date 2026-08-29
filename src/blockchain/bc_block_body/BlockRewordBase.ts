import { ArrayList } from "../../db/base/ArrayList";
import { NullPointerException } from "../../db/base/NullPointerException";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { AbstractBlockchainTransaction } from "../bc_trx/AbstractBlockchainTransaction";
import { MerkleTree } from "../merkletree/MerkleTree";
import { AbstractBlockRewordTransaction } from "./AbstractBlockRewordTransaction";
import { CoinbaseTransaction } from "./CoinbaseTransaction";
import { StakeBaseTransaction } from "./StakeBaseTransaction";

export class BlockRewordBase {
	private coinbase : CoinbaseTransaction | null;
	private stakeBases : ArrayList<StakeBaseTransaction>;

    constructor(){
        this.coinbase = null;
        this.stakeBases = new ArrayList<StakeBaseTransaction>();       
    }

	public getCoinbaseTransaction() : CoinbaseTransaction {
        if(this.coinbase != null){
            return this.coinbase;
        }
		throw new NullPointerException("BlockRewordBase.getCoinbaseTransaction()");
	}

	public getStakeBases() : ArrayList<StakeBaseTransaction> {
		return this.stakeBases;
	}

    public addBlockRewordTransaction(trx : AbstractBlockRewordTransaction) : void {
        let type = trx.getType();
        if(type == AbstractBlockchainTransaction.TRX_TYPE_COIN_BASE){
            this.coinbase = <CoinbaseTransaction>(trx.copyData());
            return;
        }

        let strx = <StakeBaseTransaction>(trx.copyData());
        
        this.stakeBases.addElement(strx);
    }

    public binarySize() : number {
        let total = 1; // sizeof(uint8_t);

        if(this.coinbase != null){
            total += this.coinbase.binarySize();
        }

        let maxLoop = this.stakeBases.size();
        total += 1; // sizeof(uint8_t);

        for(let i = 0; i != maxLoop; ++i){
            let trx = this.stakeBases.get(i);

            if(trx != null){
                total += trx.binarySize();
            }
        }

        return total;
    }

    public toBinary(out : ByteBuffer) : void {
        let bl = this.coinbase != null;
        out.put(bl ? 1 : 0);
        if(bl && this.coinbase != null){
            this.coinbase.toBinary(out);
        }

        let maxLoop = this.stakeBases.size();
        out.put(maxLoop);

        for(let i = 0; i != maxLoop; ++i){
            let trx = this.stakeBases.get(i);
            if(trx != null){
                trx.toBinary(out);
            }
        }
    }

    public static createFromBinary(input : ByteBuffer) : BlockRewordBase {
        let base = new BlockRewordBase();

        let bl = input.get();
        if(bl > 0){
            let trx = AbstractBlockchainTransaction.createFromBinary(input);
            base.coinbase = <CoinbaseTransaction>(trx);
        }

        let maxLoop = input.get();
        for(let i = 0; i != maxLoop; ++i){
            let trx = AbstractBlockchainTransaction.createFromBinary(input);
            let stakeTrx = <StakeBaseTransaction>(trx);

            base.addBlockRewordTransaction(stakeTrx);
        }

        return base;
    }

    public buildMerkleTree(tree : MerkleTree) : void {
        if(this.coinbase != null){
            tree.addElement(this.coinbase);
        }

        let maxLoop = this.stakeBases.size();
        for(let i = 0; i != maxLoop; ++i){
            let trx = this.stakeBases.get(i);

            tree.addElement(trx);
        }
    }

    public copy() : BlockRewordBase {
        let inst = new BlockRewordBase();
        inst.coinbase = this.coinbase != null ? <CoinbaseTransaction>(this.coinbase.copyData()) : null;

        inst.stakeBases = new ArrayList<StakeBaseTransaction>();

        let maxLoop = this.stakeBases.size();
        for(let i = 0; i != maxLoop; ++i){
            let trx = this.stakeBases.get(i);
            if(trx != null){
                inst.addBlockRewordTransaction(trx);
            }
        }

        return inst;
    }
}