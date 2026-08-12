import { CFile } from "../base_io/CFile";
import { FileDescriptor } from "./FileDescriptor";

import fs from 'node:fs';

export class Os {
    public static openFile2Write(file : CFile, append : boolean, sync : boolean) : FileDescriptor {
        let path = file.toString();

        let flag : string;
        let size : number = 0;
        if(append){
            flag = "a";
            if(file.exists()){
                size = file.length();
            }
        }else{
            flag = "w"
        }

        if(sync){
            flag = flag + "s";
        }

        let fd = fs.openSync(path, flag);

        let desc = new FileDescriptor(fd);
        desc.setSync(sync);
        desc.setPosition(size);

        return desc;
    }

    public openFile2Read(file : CFile) : FileDescriptor {
        let path = file.toString();
        let flag : string = "r";

        let fd = fs.openSync(path, flag);
        let desc = new FileDescriptor(fd);
        return desc;
    }

    public openFile2ReadWrite(file : CFile, sync : boolean) : FileDescriptor {
        let path = file.toString();

        let flag : string;
        if(sync){
            flag = "as+";
        }else{
            flag = "a+";
        }

        let fd = fs.openSync(path, flag);
        let desc = new FileDescriptor(fd);
        return desc;
    }

    public syncFile(desc : FileDescriptor) : void {
        let fd = desc.getFd();
        fs.fdatasyncSync(fd);
    }

}
