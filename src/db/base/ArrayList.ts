
export class ArrayList<T> {
    private numArray : number;
    private currentSize : number;
    private root : (T | null)[];
    private cursor : number;
    private sorted : boolean;

    constructor(defaultSize = 32) {
        this.numArray = 0;
        this.currentSize = defaultSize;
        this.root = Array.from({length: this.numArray});
        this.cursor = 0;
        this.sorted = true;
    }

    public addElement(ptr : T | null){
        if(this.currentSize <= this.numArray){
            this.realloc();
        }

        this.root[this.cursor++] = ptr;
        this.numArray++;
    }

    public setElement(ptr : T | null, index : number) : void {
        this.root[index] = ptr;
    }

    public reset() {
        this.numArray = 0;
        this.cursor = 0;
        this.sorted = true;
    }

    private realloc() {
        let size = this.currentSize * 2;

        let newPtr : T[] = Array.from({length: size});

        let max = this.currentSize;
        this.__copy(newPtr, 0, this.root, 0, max);

        this.currentSize = size;
        this.root = newPtr;
    }

    private __copy(dest : (T | null)[], dest_start : number, src : (T | null)[], src_start : number, count : number) : void {
        let d = dest_start;
        let s = src_start;

        for(let i = 0; i != count; ++i){
            dest[d++] = src[s++];
        }
    }

    public size() : number {
        return this.numArray;
    }
    public get(pos : number) : T | null{
        return this.root[pos];
    }

    public isEmpty() : boolean {
		return this.numArray == 0;
	}

    public remove(index : number) : T | null
	{
		let ptr = this.get(index);
		this.removeRange(index, 1);

		return ptr;
	}

	public removeRange(index : number, length : number) : void
	{
		let copySize = (this.numArray - index - length);
		if(copySize > 0){
			for(let i = 0; i < copySize; i++){
				this.root[index + i] = this.root[index + i + length];
			}
			//__move(this->root, index, this->root, index + length, copySize);
		}

		this.numArray = this.numArray - length;
		this.cursor -= length;
	}
}
