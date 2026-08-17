

export class RawArrayPrimitive<T> {
	private numArray : number;
	private currentSize;
	private root : T[];
	private sorted : boolean; 

    constructor(defaultSize : number = 8) {
        this.numArray = 0;
        this.currentSize = defaultSize;
        this.root = new Array<T>(this.currentSize);
        this.sorted = false;
    }

    public reset() : void {
        this.numArray = 0;
        this.sorted = false;
    }

    public addElement(value : T, index? : number) : void{
        if(index != undefined){
            this.__addElement(value, index);
            return;
        }
        // extends
        if(!(this.currentSize > this.numArray)){
            let size = this.currentSize * 2;

            let newPtr = new Array<T>(size);
            newPtr.fill(<T>0, this.currentSize);

            for(let i = 0; i != this.currentSize; ++i){
                newPtr[i] = this.root[i];
            }

			this.root = newPtr;
			this.currentSize = size;
        }

        this.root[this.numArray++] = value;
        this.sorted = false;
    }

    private __addElement(value : T, index : number) {
        // extends
        if(!(this.currentSize > this.numArray)){
            let size = this.currentSize * 2;

            let newPtr = new Array<T>(size);
            newPtr.fill(<T>0, this.currentSize);

            for(let i = 0; i != this.currentSize; ++i){
                newPtr[i] = this.root[i];
            }

			this.root = newPtr;
			this.currentSize = size;
        }
        
        let copySize = this.numArray - index;
        if(copySize > 0){
            for(let i = this.numArray - 1; i > index; --i){
                this.root[i] = this.root[i - 1];
            }
        }

		this.numArray++;
		this.root[index] = value;
    }
}