import { off } from "node:cluster";
import { CFile } from "../base_io/CFile";
import { FileDescriptor } from "./FileDescriptor";

import fs from 'node:fs';

enum SeekOrigin {
    FROM_BEGINING = 0,
    CURRENT_POS = 1,
    FROM_END = 2
};

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

        let desc = new FileDescriptor(fd, path);
        desc.setSync(sync);
        desc.setPosition(size);

        return desc;
    }

    public openFile2Read(file : CFile) : FileDescriptor {
        let path = file.toString();
        let flag : string = "r";

        let fd = fs.openSync(path, flag);
        let desc = new FileDescriptor(fd, path);
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
        let desc = new FileDescriptor(fd, path);
        return desc;
    }

    public syncFile(desc : FileDescriptor) : void {
        let fd = desc.getFd();
        fs.fdatasyncSync(fd);
    }

    public closeFileDescriptor(desc : FileDescriptor) : void {
        if(desc.isOpened()){
            let fd = desc.getFd();

            desc.setFd(0);
            fs.closeSync(fd);
        }

    }

    public seekFile(desc : FileDescriptor, offset : number, origin : SeekOrigin) : void {
        let position = 0;

        if(origin == SeekOrigin.FROM_BEGINING){
            position = offset;
        }
        else if(origin = SeekOrigin.CURRENT_POS){
            position = desc.getPosition() + offset;
        }
        else {
            position = desc.length() + offset;
        }

        desc.setPosition(position);
    }
}
