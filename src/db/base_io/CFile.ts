

// const path = require('path');
import path from 'node:path';
import fs from 'node:fs';


export class CFile {
    private pathname : string;

    constructor(pathname : string){
        this.pathname = pathname;
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

}
