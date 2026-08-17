
export class BtreeConfig {
    private defaultSize : number;
    private blockSize : number;
    private nodeNumber : number;

    constructor() {
        this.defaultSize = 1024;
        this.blockSize = 64;
        this.nodeNumber = 8;
    }

    
}