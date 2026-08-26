import { NodeBuilderFlags } from "typescript";
import { SchnorrSignature } from "../../base/crypto/SchnorrSignature";
import { AddressDescriptor } from "../bc_base/AddressDescriptor";
import { NodeIdentifier } from "../bc_network/NodeIdentifier";
import { AbstractFinalizerTransaction } from "./AbstractFinalizerTransaction";
import { AbstractBlockchainTransaction } from "../bc_trx/AbstractBlockchainTransaction";
import { NullPointerException } from "../../db/base/NullPointerException";
import { VariableBlockFileBody } from "../../db/filestore_variable_block/VariableBlockFileBody";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { Sha256 } from "../../base/crypto/Sha256";
import { TransactionId } from "../bc_trx/TransactionId";
import { Schnorr } from "../../base/crypto/Schnorr";
import { NodeIdentifierSource } from "../bc_network/NodeIdentifierSource";
import { MerkleTree } from "../merkletree/MerkleTree";


export class RegisterVotePoolTransaction extends AbstractFinalizerTransaction {
	private nodeId : NodeIdentifier|null;
	private addressDesc : AddressDescriptor|null; // voter address
    private voterSig : SchnorrSignature|null;

    constructor(nodeId? : NodeIdentifier, addressDesc? : AddressDescriptor){
        super();

        if(nodeId != undefined && addressDesc != undefined){
            this.nodeId = <NodeIdentifier>(nodeId.copyData());
            this.addressDesc = <AddressDescriptor>addressDesc.copyData();
            this.voterSig = null;
        }else{
            this.nodeId = null
            this.addressDesc = null;
            this.voterSig = null;
        }
    }

    public getType() : number {
        return AbstractBlockchainTransaction.TRX_TYPE_REGISTER_VOTE_POOL;
    }

	public getNodeId() : NodeIdentifier {
        if(this.nodeId != null){
            return this.nodeId;
        }
		throw new NullPointerException("RegisterVotePoolTransaction.getNodeId()");
	}
	public getAddressDesc() : AddressDescriptor {
        if(this.addressDesc != null){
		    return this.addressDesc;
        }
        throw new NullPointerException("RegisterVotePoolTransaction.getAddressDesc()");
	}

    public binarySize() : number {
        if(this.addressDesc != null && this.nodeId != null && this.voterSig != null){
            let total = super.binarySize();

            total += this.nodeId.binarySize();
            total += this.addressDesc.binarySize();

            total += 1; // sizeof(uint8_t);
            if(this.voterSig != null){
                total += this.voterSig.binarySize();
            }

            return total;
        }
        throw new NullPointerException("RegisterVotePoolTransaction.binarySize()");
    }

    public toBinary(out : ByteBuffer) : void {
        if(this.addressDesc != null && this.nodeId != null && this.voterSig != null){
            super.toBinary(out);

            this.nodeId.toBinary(out);
            this.addressDesc.toBinary(out);

            let bl = this.voterSig != null;
            out.put(bl ? 1 : 0);
            if(bl){
                this.voterSig.toBinary(out);
            }
            return;
        }
        throw new NullPointerException("RegisterVotePoolTransaction.toBinary()");
    }

    public fromBinary(input : ByteBuffer) {
        super.fromBinary(input);

        this.nodeId = NodeIdentifier.fromBinary(input);
        this.addressDesc = AddressDescriptor.createFromBinary(input);

        let bl = input.get();
        if(bl > 0){
            this.voterSig = SchnorrSignature.createFromBinary(input);
        }
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

    public voterSign(source : NodeIdentifierSource): void {
        if(this.nodeId != null && this.trxId != null){
            this.voterSig = null;

            let data = this.trxId.toArray();
            let length = this.trxId.size();

            this.voterSig = Schnorr.sign(source.getSecretKey(), this.nodeId.getPublicKey(), data, length);
            return;
        }
        throw new NullPointerException("RegisterVotePoolTransaction.voterSign()");
    }

    public verifyVoterSign() :boolean {
        if(this.nodeId != null && this.trxId != null && this.voterSig != null){
            let data = this.trxId.toArray();
            let length = this.trxId.size();

            let result = Schnorr.verifySig(this.voterSig, this.nodeId.getPublicKey(), data, length);
            return result;
        }
        throw new NullPointerException("RegisterVotePoolTransaction.verifyVoterSign()");
    }

    public addInternalMerkleTreeElement(tree : MerkleTree) : void {
        if(this.nodeId != null){
            let pub = this.nodeId.getPublicKey();
            let buff = pub.toBinary();
            tree.addElement(buff);
            return;
        }
        throw new NullPointerException("RegisterVotePoolTransaction.verifyVoterSign()");
    }

}