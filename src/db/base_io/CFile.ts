

const path = require('path');
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
        return path.exists(this.pathname);
    }

    public mkdirs() : boolean {
        let abs : string = path.resolve(this.pathname);
        let res = fs.mkdirSync(this.pathname, {recursive : true});

        return true;
    }

}
