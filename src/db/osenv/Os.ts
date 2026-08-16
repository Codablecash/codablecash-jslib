import { CFile } from "../base_io/CFile";
import { FileDescriptor } from "./FileDescriptor";

import fs, { writeSync } from 'node:fs';


export enum SeekOrigin {
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

    public static openFile2Read(file : CFile) : FileDescriptor {
        let path = file.toString();
        let flag : string = "r";

        let fd = fs.openSync(path, flag);
        let desc = new FileDescriptor(fd, path);
        return desc;
    }

    public static openFile2ReadWrite(file : CFile, sync : boolean) : FileDescriptor {
        let path = file.toString();

        if(!file.exists()){
             let fd = fs.openSync(path, "a");
             fs.closeSync(fd);
        }

        let flag : string;
        if(sync){
            flag = "rs+";
        }else{
            flag = "r+";
        }

        let fd = fs.openSync(path, flag);
        let desc = new FileDescriptor(fd, path);
        desc.setFlag(flag);

        let fileSize = file.length();
        desc.setFileSize(fileSize);

        return desc;
    }

    public static syncFile(desc : FileDescriptor) : void {
        let fd = desc.getFd();
        fs.fdatasyncSync(fd);
    }

    public static closeFileDescriptor(desc : FileDescriptor) : void {
        if(desc.isOpened()){
            let fd = desc.getFd();

            desc.setFd(0);
            fs.closeSync(fd);
        }

    }

    public static seekFile(desc : FileDescriptor, offset : number, origin : SeekOrigin) : number {
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

        return position;
    }

    public static readFile(desc : FileDescriptor, data : Uint8Array, length : number) : number {
        let fd = desc.getFd();
        let position = desc.getPosition();

        let n = fs.readSync(fd, data, 0, length, position);
        desc.incPosition(n);

        return n;
    }

    public static write2File(desc : FileDescriptor, data : Uint8Array, length : number) : number {
        let fd = desc.getFd();

        let fileSize = desc.getFileSize();
        let total = 0;

        let position = desc.getPosition();
        let maxPosition = position + length;
        let firstLength = fileSize < maxPosition ? fileSize - position : length;
        {

            if(firstLength > 0){
                let n = fs.writeSync(fd, data, 0, firstLength, position);
                desc.incPosition(n);
                total += n;
            }

        }

        {
            let addLength = fileSize < maxPosition ? maxPosition - fileSize : 0;
            if(addLength > 0){
                // switch to a+ mode;
                let lastFlag = desc.getFlag();
                let path = desc.getPath();

                fs.closeSync(fd);

                {
                    fd = fs.openSync(path, "a+")
                    let position = desc.getPosition();
                    let n = fs.writeSync(fd, data, fileSize, addLength, position);
                    desc.incPosition(n);
                    total += n;

                    fs.closeSync(fd);
                }


                // reopen
                fd = fs.openSync(path, lastFlag);
                desc.setFd(fd);
                desc.setFileSize(maxPosition);
            }

        }


        return total;

    }
}
