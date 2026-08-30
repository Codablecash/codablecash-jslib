import { IComparable } from "./IComparable";

type ArrayListCmp = (x : IComparable | null, y : IComparable | null) => number;

function defaultCompare(x : IComparable | null, y : IComparable | null) : number {
    if(x == null){
        if(y == null){
            return 0;
        }
        else {
            return 1;
        }
    }

    return x.compareTo(y);
}

export class ArrayList<T extends IComparable> {
    private numArray : number;
    private currentSize : number;
    private root : (T | null)[];
    private cursor : number;
    private sorted : boolean;
    private compare : ArrayListCmp;

    constructor(defaultSize = 32, cmp : ArrayListCmp = defaultCompare) {
        this.numArray = 0;
        this.currentSize = defaultSize;
        this.root = Array.from({length: this.numArray});
        this.cursor = 0;
        this.sorted = true;
        this.compare = cmp;
    }

    public addElement(ptr : T | null){
        if(this.currentSize <= this.numArray){
            this.realloc();
        }

        this.root[this.cursor++] = ptr;
        this.numArray++;
    }

	public addAll(list : ArrayList<T>){
		let maxLoop = list.size();
		for(let i = 0; i != maxLoop; ++i){
			let ptr = list.get(i);
			this.addElement(ptr);
		}
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

    public indexOfPtr(ptr :T) : number {
		let maxLoop = this.size();
		for(let i = 0; i != maxLoop; ++i){
			let other = this.get(i);

            if(this.compare(ptr, other) == 0){
				return i;
			}
		}

		return -1;
	}
}
