import { NullPointerException } from "../../db/base/NullPointerException";
import { ByteBuffer } from "../../db/base_io/ByteBuffer";
import { CFile } from "../../db/base_io/CFile";
import { DiskCacheManager } from "../../db/random_access_file/DiskCacheManager";
import { RandomAccessFile } from "../../db/random_access_file/RandomAccessFile";
import { AbstractConfigStoreElement } from "./AbstractConfigStoreElement";
import { BinaryValueConfigStoreValue } from "./BinaryValueConfigStoreValue";
import { LongValueConfigStoreValue } from "./LongValueConfigStoreValue";
import { ShortValueConfigStoreValue } from "./ShortValueConfigStoreValue";

export class StatusStore {
    private file: CFile;
    private baseDir: CFile;
    private diskCacheManager : DiskCacheManager;
    private store : RandomAccessFile | null;
    private map : Map<string, AbstractConfigStoreElement>;

    constructor(baseDir : CFile, name : string){
        this.baseDir = baseDir;
        this.file = this.baseDir.get(name);
        this.store = null;
        this.map = new Map<string, AbstractConfigStoreElement>();

        this.diskCacheManager = new DiskCacheManager();
    }

    public exists() : boolean {
        return this.file.exists();
    }

    public open() : void {
        if(!this.baseDir.exists()){
            this.baseDir.mkdirs();
        }

        this.store = new RandomAccessFile(this.file, this.diskCacheManager);
        this.store.open(false);
    }

    public close() : void {
        if(this.store != null){
            this.store.close();
            this.store = null;
        }
    }

    public addLongValue(key : string, value : number) : void {
        let v = new LongValueConfigStoreValue(value);

        this.addValue(key, v);
    }


    public addValue(key : string, value : AbstractConfigStoreElement) {
        this.__nlk_addValue(key, value);
    }

    public __nlk_addValue(key : string, value : AbstractConfigStoreElement) {
        this.map.set(key, value);

        this.open();
        this.write();
        this.close();
    }

    public getShortValue(key : string) : number {
        let v = this.getValue(key);
        let value = <ShortValueConfigStoreValue>(v);

        return value.getValue();
    }

    public getBinaryValue(key : string) : ByteBuffer {
        let v = this.getValue(key);
        let value = <BinaryValueConfigStoreValue>(v);

        return ByteBuffer.wrapWithEndian(value.getData(), value.getLength(), true);
    }    

    public getLongValue(key : string) : bigint {
        let v = this.getValue(key);
        let value = <LongValueConfigStoreValue>(v);

        return value.getValue();
    }

    public getValue(key : string) : AbstractConfigStoreElement {
        let v = this.map.get(key);
        if(v != undefined){
            return v;
        }
        throw new NullPointerException("StatusStore.getValue() key : " + key);
    }

    public load() : void {
        this.open();

        if(this.store != null){
            let totalSize = new Uint8Array(4);
            this.store.read(0, totalSize, 4);

            let sb = ByteBuffer.wrapWithEndian(totalSize, 4, true);
            sb.position(0);
            let total = sb.getInt();

            let bin = new Uint8Array(total);

            this.store.read(4, bin, total);
            let buff = ByteBuffer.wrapWithEndian(bin, total, true);

            let maxLoop = buff.getInt();
            for(let i = 0; i != maxLoop; ++i){
                let key = this.getString(buff);
                let value = AbstractConfigStoreElement.createFromBinary(buff);

                this.__nlk_addValue(key, value);
            }
        }

        this.close();
    }

    public write() : void {
        if(this.store != null){
            let size = this.binarySize();

            let buff = ByteBuffer.allocateWithEndian(size, true);

            let mapSize = this.map.size;
            buff.putInt(mapSize);

            for(const key of this.map.keys()){
                let value = this.map.get(key);

                this.putString(buff, key);

                if(value != undefined){
                    value.toBinary(buff);
                }
            }

            this.store.setLength(size + 4);

            let sb = ByteBuffer.allocateWithEndian(4, true);
            sb.putInt(size);
            this.store.write(0, sb.toUint8Array(), sb.limit());

            this.store.write(4, buff.toUint8Array(), buff.limit());
        }
    }

    public binarySize() : number {
        let total = 0;

        total += 4; //sizeof(int);

        for(const key of this.map.keys()){
            let value = this.map.get(key);

            total += this.stringSize(key);
            if(value != undefined){ // gard
                total += value.binarySize();
            }
            
        }

        return total;
    }

    public putString(out : ByteBuffer, str : string) : void {
        let maxLoop = str.length;
        out.putInt(maxLoop);

        for(let i = 0; i != maxLoop; ++i){
            let ch = str.charCodeAt(i);
            out.putShort(ch);
        }
    }

    public getString(input : ByteBuffer) : string {
        let ret = "";
        let maxLoop = input.getInt();
        for(let i = 0; i != maxLoop; ++i){
            let ch = input.getShort();

            ret = ret + String.fromCharCode(ch);
        }

        return ret;
    }

    public stringSize(str : string) : number {
        return 4 + (str.length * 2); //sizeof(uint32_t) + str->length() * sizeof(uint16_t);
    }
}