import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { BinaryFormatException } from "../../db/filestore_block/BinaryFormatException";
import { BigInteger } from "../../db/numeric/BigInteger";
import { SchnorrKeyPair } from "./SchnorrKeyPair";

export abstract class IKeyPair {
    static readonly PAIR_SCHNORR : number = 1;

	public abstract clone() : IKeyPair;
	public abstract toBinary(out : ByteBuffer) : void ;
	public abstract binarySize() : number;
	public abstract fromBinary(input : ByteBuffer) : void;

	public abstract getPubKey() : BigInteger;
	public abstract getSecretKey() : BigInteger;

	public static createFromBinary(input : ByteBuffer) {
		let type = input.get();

		let pair = null;
		switch (type) {
			case IKeyPair.PAIR_SCHNORR:
				pair = new SchnorrKeyPair();
				break;
			default:
				throw new BinaryFormatException("Wrong key pair.");
		}

		pair.fromBinary(input);

		return pair;
	}
}