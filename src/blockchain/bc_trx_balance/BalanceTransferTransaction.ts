import { Sha256 } from "../../base/crypto/Sha256";
import { Secp256k1CompressedPoint } from "../../base/ecda/Secp256k1CompressedPoint";
import { Secp256k1Point } from "../../base/ecda/Secp256k1Point";
import { MuSig } from "../../base/musig/MuSig";
import { ArrayList } from "../../db/base/ArrayList";
import { NullPointerException } from "../../db/base/NullPointerException";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { SystemTimestamp } from "../../db/base_timestamp/SystemTimestamp";
import { BigInteger } from "../../db/numeric/BigInteger";
import { AddressDescriptor } from "../bc_base/AddressDescriptor";
import { BalanceUnit } from "../bc_base/BalanceUnit";
import { AbstractBalanceTransaction } from "../bc_trx/AbstractBalanceTransaction";
import { AbstractBlockchainTransaction } from "../bc_trx/AbstractBlockchainTransaction";
import { AbstractUtxo } from "../bc_trx/AbstractUtxo";
import { AbstractUtxoReference } from "../bc_trx/AbstractUtxoReference";
import { TransactionId } from "../bc_trx/TransactionId";
import { TransactionVersion } from "../bc_trx/TransactionVersion";
import { BalanceUtxo } from "./BalanceUtxo";
import { BalanceUtxoReference } from "./BalanceUtxoReference";
import { BalanceUtxoSign } from "./BalanceUtxoSign";
import { IMuSigSignerProvidor } from "./IMuSigSignerProvidor";
import { InputUtxoCollection } from "./InputUtxoCollection";
import { IUtxoFinder } from "./IUtxoFinder";


export class BalanceTransferTransaction extends AbstractBalanceTransaction {
	private inputs : InputUtxoCollection;
	private list : ArrayList<BalanceUtxo>;
	private fee : BalanceUnit;
	private signature : BalanceUtxoSign | null;

    
    constructor(){
        super();
        this.inputs = new InputUtxoCollection();
        this.list = new ArrayList<BalanceUtxo>();
        this.fee = new BalanceUnit(0);
        this.signature = null;
    }

	public getType() : number {
		return AbstractBlockchainTransaction.TRX_TYPE_BANANCE_TRANSFER;
	}

    public binarySize() : number {
    //	BinaryUtils::checkNotNull(this.signature);

        let total = this.__binarySize();

        total += 1; // sizeof(uint8_t);
        if(this.signature != null){
            total += this.signature.binarySize();
        }

        return total;
    }

    private __binarySize() : number {
        let total = 1; // sizeof(uint8_t);
        total += this.version.binarySize();
        total += this.timestamp.binarySize();

        total += this.inputs.binarySize();

        total += 2; //sizeof(uint16_t);
        let maxLoop = this.list.size();
        for(let i = 0; i != maxLoop; ++i){
            let utxo = this.list.get(i);
            if(utxo != null){ // guard
                total += utxo.binarySize();
            }
        }

        total += this.fee.binarySize();

        return total;
    }

    public toBinary(out : ByteBuffer) : void {
        // BinaryUtils::checkNotNull(this.signature);

        this.__toBinary(out);

        let bl = this.signature != null;
        out.put(bl ? 1 : 0);

        if(this.signature != null){
            this.signature.toBinary(out);
        }
    }

    private __toBinary(out : ByteBuffer) : void {
        out.put(this.getType());
        this.version.toBinary(out);
        this.timestamp.toBinary(out);

        this.inputs.toBinary(out);

        let maxLoop = this.list.size();
        out.putShort(maxLoop);

        for(let i = 0; i != maxLoop; ++i){
            let utxo = this.list.get(i);
            if(utxo != null){
                utxo.toBinary(out);
            }
        }

        this.fee.toBinary(out);
    }

    public fromBinary(input : ByteBuffer) : void {
        this.version = TransactionVersion.createFromBinary(input);
        this.timestamp = SystemTimestamp.fromBinary(input);

        this.inputs = InputUtxoCollection.fromBinary(input);

        let maxLoop = input.getShort();
        //BinaryUtils::checkUShortRange(maxLoop, 0, MAX_INPUT_ELEMENT);
        for(let i = 0; i != maxLoop; ++i){
            let u = AbstractUtxo.createFromBinary(input);

            // BinaryUtils::checkUint8Value(u.getType(), AbstractUtxo::TRX_UTXO_BALANCE);
            let utxo = <BalanceUtxo>(u);
            this.addBalanceUtxo(utxo);
        }

        {
            let unit = BalanceUnit.fromBinary(input);
            if(unit != null){
                this.fee = unit;
            }
        }

        let bl = input.get();
        if(bl > 0){
            this.signature = BalanceUtxoSign.fromBinary(input);
        }
    }

    public addBalanceUtxo(utxo : BalanceUtxo) : void {
        let obj = <BalanceUtxo>(utxo.copyData());
        this.list.addElement(obj);
    }

    public addInputUtxoRef(ref : BalanceUtxoReference) : void {
        this.inputs.addReference(ref);
    }

    public setFeeAmount(fee : BalanceUnit, skipfeedesc? : AddressDescriptor) : void {
        this.fee = <BalanceUnit>fee.copyData();

        if(skipfeedesc != undefined){
        let discounted = false;

        let maxLoop = this.list.size();
            for(let i = 0; i != maxLoop; ++i){
                let utxo = this.list.get(i);

                if(utxo != null){ // guard
                    let desc = utxo.getAddress();

                    if(skipfeedesc != null && desc.compareTo(skipfeedesc) == 0){
                        continue;
                    }

                    if(!discounted){
                        utxo.discountFee(fee);
                        discounted = true;
                    }
                }
            }
        }
    }

    public getFeeRate() : BalanceUnit  {
        let size = this.binarySize();
        let lfee = this.fee.getAmount();

        let rate = Math.trunc(lfee /size);

        return new BalanceUnit(rate);
    }

    public build() : void {
        this.setUtxoNonce();

        let capacity = this.__binarySize();
        let buff = ByteBuffer.allocateWithEndian(capacity, true);

        this.__toBinary(buff);
        buff.position(0);

        let sha = Sha256.sha256(buff.toUint8Array(), true);

        this.trxId = new TransactionId(sha.toUint8Array(), sha.limit());
    }

    private setUtxoNonce() : void {
        let capacity = 1 +  this.version.binarySize() + this.timestamp.binarySize() + this.inputs.binarySize();

        let buff = ByteBuffer.allocateWithEndian(capacity, true);
        buff.put(this.getType());
        this.version.toBinary(buff);
        this.timestamp.toBinary(buff);
        this.inputs.toBinary(buff);

        let sha = Sha256.sha256(buff.toUint8Array(), true);
        let data = sha.toUint8Array();

        let maxLoop = this.list.size();
        for(let i = 0; i != maxLoop; ++i){
            let utxo = this.list.get(i);

            if(utxo != null){ // guard
                utxo.setNonce(data, i);
                utxo.build();
            }
        }
    }

    public sign(providor : IMuSigSignerProvidor, finder : IUtxoFinder) {
        if(this.trxId != null){
            let length = this.trxId.size();
            let data = this.trxId.toArray();

            let sig = this.inputs.sign(providor, finder, data, length);
            let R = sig.getR();
            let __R = Secp256k1CompressedPoint.compress(R);

            let s = sig.gets();

            this.signature = new BalanceUtxoSign(__R, s);
        }
        throw new NullPointerException("BalanceTransferTransaction.sign()");
    }

    public verify() : boolean {
        if(this.signature != null && this.trxId != null){
            let R = this.signature.getR();
            let ptR = R.decompress();
            let s = this.signature.gets();

            let sig = new MuSig(ptR, s);

            let list = this.inputs.getList();
            let maxLoop = list.size();
            for(let i = 0; i != maxLoop; ++i){
                let ref = list.get(i);

                if(ref != null){
                    let XiCompressed = ref.getXi();
                    let Xi = XiCompressed.decompress();

                    sig.addXi(Xi);
                }
            }

            let length = this.trxId.size();
            let data = this.trxId.toArray();

            let bl = sig.verify(data, length);
            return bl;
        }
        throw new NullPointerException("BalanceTransferTransaction.verify()");
    }

	public getUtxoSize() : number {
		return this.list.size();
	}
	public getUtxo(i : number) : AbstractUtxo {
		let ret =  this.list.get(i);
        if(ret != null){
            return ret;
        }
        throw new NullPointerException("BalanceTransferTransaction.getUtxo()");
	}

    public getUtxoRefList() : ArrayList<BalanceUtxoReference> {
        return this.inputs.getList();
    }

    public getUtxoReferenceSize() : number {
        return this.inputs.getList().size();
    }

    public getUtxoReference(i : number) : AbstractUtxoReference {
        let ret = this.inputs.getList().get(i);
        if(ret != null){
            return ret;
        }
        throw new NullPointerException("BalanceTransferTransaction.getUtxoReference()");
    }

    public getFee() : BalanceUnit {
        return this.fee;
    }

    public getTotalOutputBalance() : BalanceUnit {
        let total = new BalanceUnit(0);

        let maxLoop = this.getUtxoSize();
        for(let i = 0; i != maxLoop; ++i){
            let utxo = this.getUtxo(i);
            let amount = utxo.getAmount();

            total.addSelf(amount);
        }

        total.addSelf(this.fee);

        return total;
    }
}