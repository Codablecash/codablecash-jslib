
export class ArrayList<T> {
    private numArray : number;
    private currentSize : number;
    private root : T[];
    private cursor : number;
    private sorted : boolean;

    constructor(defaultSize = 32) {
        this.numArray = 0;
        this.currentSize = defaultSize;
        this.root = Array.from({length: this.numArray});
        this.cursor = 0;
        this.sorted = true;
    }

    public addElement(ptr : T){
        if(this.currentSize <= this.numArray){
            this.realloc();
        }

        this.root[this.cursor++] = ptr;
        this.numArray++;
    }

    private realloc() {
        let size = this.currentSize * 2;

        let newPtr : T[] = Array.from({length: size});

        let max = this.currentSize;
        this.__copy(newPtr, 0, this.root, 0, max);

        this.currentSize = size;
        this.root = newPtr;
    }

    private __copy(dest : T[], dest_start : number, src : T[], src_start : number, count : number) : void {
        let d = dest_start;
        let s = src_start;

        for(let i = 0; i != count; ++i){
            dest[d++] = src[s++];
        }
    }

    public size() : number {
        return this.numArray;
    }
    public get(pos : number) : T {
        return this.root[pos];
    }
}
