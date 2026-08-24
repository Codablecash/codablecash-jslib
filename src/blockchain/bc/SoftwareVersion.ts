import { ByteBuffer } from "../../db/base_io/ByteBuffer";


export class SoftwareVersion {
	protected major : number;
	protected minor : number;
	protected patch : number;

    constructor(major : number, minor : number, patch : number){
        this.major = major;
        this.minor = minor;
        this.patch = patch;
    }

    public toLongValue() : bigint {
        let v = BigInt(this.major);
        v = v << 16n;
        v = v + BigInt(this.minor);
        v = v << 16n;
        v = v + BigInt(this.patch);

        return v;
    }

    public compareTo(other : SoftwareVersion) : number {
        let diff = this.major - other.major;
        if(diff != 0){
            return diff;
        }

        diff = this.minor - other.minor;
        if(diff != 0){
            return diff;
        }

        diff = this.patch - other.patch;
        return diff;
    }

    public binarySize() : number {
        return 3;
    }

    public toBinary(out : ByteBuffer) : void {
        out.put(this.major);
        out.put(this.minor);
        out.put(this.patch);
    }

    public createFromBinary(input : ByteBuffer) : SoftwareVersion {
        let major = input.get();
        let minor = input.get();
        let pathch = input.get();

        return new SoftwareVersion(major, minor, pathch);
    }
}