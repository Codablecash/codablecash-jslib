

const path = require('path');

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
}
