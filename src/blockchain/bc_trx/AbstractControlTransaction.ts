import { Sha256 } from "../../base/crypto/Sha256";
import { Secp256k1CompressedPoint } from "../../base/ecda/Secp256k1CompressedPoint";
import { MuSig } from "../../base/musig/MuSig";
import { ArrayList } from "../../db/base/ArrayList";
import { NullPointerException } from "../../db/base/NullPointerException";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { SystemTimestamp } from "../../db/base_timestamp/SystemTimestamp";
import { BalanceUnit } from "../bc_base/BalanceUnit";
import { BalanceUtxo } from "../bc_trx_balance/BalanceUtxo";
import { BalanceUtxoReference } from "../bc_trx_balance/BalanceUtxoReference";
import { BalanceUtxoSign } from "../bc_trx_balance/BalanceUtxoSign";
import { IMuSigSignerProvidor } from "../bc_trx_balance/IMuSigSignerProvidor";
import { InputUtxoCollection } from "../bc_trx_balance/InputUtxoCollection";
import { IUtxoFinder } from "../bc_trx_balance/IUtxoFinder";
import { AbstractBalanceTransaction } from "./AbstractBalanceTransaction";
import { AbstractUtxo } from "./AbstractUtxo";
import { AbstractUtxoReference } from "./AbstractUtxoReference";
import { TransactionVersion } from "./TransactionVersion";


export abstract class AbstractControlTransaction extends AbstractBalanceTransaction {
	protected inputs : InputUtxoCollection;
	protected list : ArrayList<BalanceUtxo>;
	protected fee : BalanceUnit;
	protected signature : BalanceUtxoSign | null;

    constructor(){
        super();
        this.inputs = new InputUtxoCollection();
        this.list = new ArrayList<BalanceUtxo>();
        this.fee = new BalanceUnit(0);
        this.signature = null;
    }

    public addInputUtxoRef(ref : BalanceUtxoReference) : void {
        this.inputs.addReference(ref);
    }

    public addBalanceUtxo(utxo : BalanceUtxo) : void {
        let obj = <BalanceUtxo>(utxo.copyData());
        this.list.addElement(obj);
    }

    public binarySize() : number {
        let total = this.__binarySize();

        total += 1; // sizeof(uint8_t);
        if(this.signature != null){
            total += this.signature.binarySize();
        }

        return total;
    }

    protected __binarySize() : number {
        let total = 1; //sizeof(uint8_t);
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
        this.__toBinary(out);

        let bl = this.signature != null;
        out.put(bl ? 1 : 0);
        if(this.signature != null){
            this.signature.toBinary(out);
        }
    }
    protected __toBinary(out : ByteBuffer) : void {
        out.put(this.getType());
        this.version.toBinary(out);
        this.timestamp.toBinary(out);

        this.inputs.toBinary(out);

        let maxLoop = this.list.size();
        out.putShort(maxLoop);

        for(let i = 0; i != maxLoop; ++i){
            let utxo = this.list.get(i);
            if(utxo != null){ // guard
                utxo.toBinary(out);
            }
        }

        this.fee.toBinary(out);
    }

    public fromBinary(input : ByteBuffer) : void {
        this.__fromBinary(input);

        let bl = input.get();
        if(bl > 0){
            this.signature = BalanceUtxoSign.fromBinary(input);
        }
    }
    protected __fromBinary(input : ByteBuffer) : void {
        this.version = TransactionVersion.createFromBinary(input);
        this.timestamp = SystemTimestamp.fromBinary(input);

        this.inputs = InputUtxoCollection.fromBinary(input);

        let maxLoop = input.getShort();
        //inaryUtils::checkUShortRange(maxLoop, 0, MAX_INPUT_ELEMENT);
        for(let i = 0; i != maxLoop; ++i){
            let u = AbstractUtxo.createFromBinary(input);

            //BinaryUtils::checkUint8Value(u.getType(), AbstractUtxo.TRX_UTXO_BALANCE);
            let utxo = <BalanceUtxo>(u);
            this.addBalanceUtxo(utxo);
        }

        {
            let unit = BalanceUnit.fromBinary(input);
            if(unit != null){
                this.fee = unit;
            }
        }
    }

    public setFeeAmount(fee : BalanceUnit) : void {
        this.fee = fee;
    }

    public sign(providor : IMuSigSignerProvidor, finder : IUtxoFinder) : void {
        if(this.trxId != null){
            let length = this.trxId.size();
            let data = this.trxId.toArray();

            let sig = this.inputs.sign(providor, finder, data, length);
            let R = sig.getR();
            let __R = Secp256k1CompressedPoint.compress(R);

            let s = sig.gets();

            this.signature = new BalanceUtxoSign(__R, s);
            return;
        }
        throw new NullPointerException("AbstractControlTransaction.sign()");
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

                if(ref != null){ // guard
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
        throw new NullPointerException("AbstractControlTransaction.verify()");
    }

    protected setUtxoNonce() : void {
        let capacity = 1 + this.version.binarySize() + this.timestamp.binarySize() + this.inputs.binarySize();

        let buff = ByteBuffer.allocateWithEndian(capacity, true);
        buff.put(this.getType());
        this.version.toBinary(buff);
        this.timestamp.toBinary(buff);
        this.inputs.toBinary(buff);

        //__ASSERT_POS(buff);

        let sha = Sha256.sha256(buff.toUint8Array(), true);
        let data = sha.toUint8Array();

        let maxLoop = this.getUtxoSize();
        for(let i = 0; i != maxLoop; ++i){
            let utxo = this.getUtxo(i);

            utxo.setNonce(data, i);
            utxo.build();
        }
    }

    public getFeeRate() : BalanceUnit {
        let size = this.binarySize();
        let lfee = this.fee.getAmount();

        let rate = lfee /size;

        return new BalanceUnit(rate);
    }

    public getUtxoSize() : number {
        return this.list.size();
    }

    public getUtxo(i : number) : AbstractUtxo {
        let ret = this.list.get(i);
        if(ret != null){
            return ret;
        }
        throw new NullPointerException("AbstractControlTransaction.getUtxo()");
    }

    public getUtxoReferenceSize() : number {
        return this.inputs.getList().size();
    }

    public getUtxoReference(i : number) : AbstractUtxoReference {
        let ret = this.inputs.getList().get(i);
        if(ret != null){
            return ret;
        }
        throw new NullPointerException("AbstractControlTransaction.getUtxoReference()");   
    }

    public getFee() : BalanceUnit {
        return this.fee;
    }
}