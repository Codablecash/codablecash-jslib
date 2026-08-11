

// const path = require('path');
import path from 'node:path';
import fs from 'node:fs';
import rmSync from 'node:fs';


export class CFile {
    private pathname : string;

    constructor(pathname : string){
        this.pathname = pathname;
    }

    public toString() : string {
        return this.pathname;
    }

    public getAbsolutePath() : string {
        let abs : string = path.resolve(this.pathname);

        return abs;
    }
    public isAbsolute() : boolean {
        return path.isAbsolute(this.pathname);
    }
    public exists() : boolean {
        return fs.existsSync(this.pathname);
    }
    public isDirectory() : boolean {
        const status = fs.statSync(this.pathname);
        return status.isDirectory();
    }
    public isFile() : boolean {
        const status = fs.statSync(this.pathname);
        return status.isFile();       
    }

    public mkdirs() : boolean {
        let ex : boolean = this.exists();

        if(!ex){
            let abs : string = path.resolve(this.pathname);
            fs.mkdirSync(this.pathname, {recursive : true});
        }

        return !ex;
    }

    public deleteFile() : boolean {
        let exec = this.exists() && this.isFile();
        if(exec){
            fs.rmSync(this.pathname);
        }
        return exec;
    }
    public deleteDir() : boolean {
        let exec = this.exists() && this.isDirectory();
        if(exec){
            fs.rmdirSync(this.pathname);
        }
        return exec;      
    }

    public get(seg : string) : CFile {
        let newPath = path.join(this.pathname, seg);
        return new CFile(newPath);
    }

    public length() : number {
        const status = fs.statSync(this.pathname);
        return status.size;
    }
}
