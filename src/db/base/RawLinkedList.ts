import { IComparable } from "./IComparable";


type RawLinkedListCmp<T extends IComparable> = (x : RawLinkedListElement<T>, y : RawLinkedListElement<T>) => number;

function defaultCompare<T extends IComparable>(x : RawLinkedListElement<T>, y : RawLinkedListElement<T>) : number {
    return x.compareTo(y);
}


export class RawLinkedList<T extends IComparable> {
    protected root : RawLinkedListElement<T> | null;
    protected last : RawLinkedListElement<T> | null;
    protected length : number;
    private compareFunctor : RawLinkedListCmp<T>;

    constructor(cmp : RawLinkedListCmp<T> = defaultCompare<T>){
        this.root = null;
        this.last = null;
        this.length = 0;
        this.compareFunctor = cmp;
    }

    public getRoot() : RawLinkedListElement<T> | null {
        return this.root;
    }

    public iterator() : RawLinkedListIterator<T> {
        let it = new RawLinkedListIterator<T>(this);
        return it;
    }

    public add(data : T) : void {
        this.addLast(data);
    }

    public __add(index : number, element: T) : RawLinkedListElement<T> {
        let newElement : RawLinkedListElement<T>;
        if(index == this.length){
            newElement = this.addLast(element);
        }
        else {
            let e = this.getElement(index);
            newElement = new RawLinkedListElement(element);

            if(e != null){
                this.addBefore(e, newElement);
            }
        }

        return newElement;
    }

    public addBefore(lastElement : RawLinkedListElement<T>, element : RawLinkedListElement<T>) : void {
		if(lastElement.prev == null){ // is root
			lastElement.prev = element;

			this.root = element;
			this.root.setNext(lastElement);

			this.length++;

			return;
		}

		let parentOfLast = lastElement.prev;

		parentOfLast.next = element;
		lastElement.prev = element;

		element.prev = parentOfLast;
		element.next = lastElement;

		this.length++;
    }

    protected addLast(data : T) : RawLinkedListElement<T> {
        let element = new RawLinkedListElement<T>(data);
        if(this.root == null){
            this.root = element;
            this.last = element;

            element.prev = null;
            element.next = null;

            this.length++;
            return element;
        }

        this.last?.setNext(element);

        element.prev = this.last;
        element.next = null;
        this.last = element;

        this.length++;
        return element;
    }

    public remove(data : T){
        let index = this.indexOf(data);
		if(index < 0){
			return false;
		}

		let del = this.getElement(index);
        if(del != null){
            this.removeElement(del);
        }
		
        return true;
    }

    public removeByIndex(index : number) : T | null {
        let del = this.getElement(index);
        if(del == null){
            return null;
        }

        let ret = del.data;
        this.removeElement(del);

        return ret;
    }

    public removeElement(element : RawLinkedListElement<T>) : void {
        if(element === this.root){
            if(element.next != null){
                element.next.prev = null;
            }
            this.root = element.next;

            if(element === this.last){
                this.last = element.prev;
            }
            this.length--;
            return;
        }
        else if(element === this.last){
			element.prev?.setNext(null);
			this.last = element.prev;

			this.length--;

			return;
        }

 		element.next?.setPrev(element.prev);
		element.prev?.setNext(element.next);

		this.length--;       
    }

    public indexOf(obj : T) {
        let target = new RawLinkedListElement<T>(obj);

        let index = 0;
        let it = new RawLinkedListIterator<T>(this);
        while(it.hasNext()){
            let d = it.nextElement();

            if(d != null && this.compareFunctor(target, d) == 0){
                return index;
            }
            ++index;
        }
        return -1;
    }

    public moveElementToTop(element : RawLinkedListElement<T>) : void {
		if(element === this.root){
			return;
		}

 		if(this.last === element){
			this.last = element.prev;
		}

		element.prev?.setNext(element.next);

		if(element.next != null){
			element.next.setPrev(element.prev);
		}

		this.root?.setPrev(element);
		element.next = this.root;
		element.prev = null;

		this.root = element;       
    }

	public get(index : number) : T | null {
		let i = 0;
		let it = new RawLinkedListIterator<T>(this); // = iterator();
		while(it.hasNext()){
			let d = it.next();

			if(i == index){
				return d;
			}
			++i;
		}
		return null;
	}

    protected getElement(index : number) : RawLinkedListElement<T> | null {
        let i = 0;
        let it = new RawLinkedListIterator<T>(this);
        while(it.hasNext()){
            let e = it.nextElement();

            if(i == index){
                return e;
            }
            ++i;
        }

        return null;
    }

    public getLastElement() : RawLinkedListElement<T> | null {
        return this.last;
    }

    public size() : number {
        return this.length;
    }
}

export class RawLinkedListElement<T extends IComparable> {
    public data : T | null;
    public next : RawLinkedListElement<T> | null;
    public prev : RawLinkedListElement<T> | null;

    constructor(ptr : T) {
        this.data = ptr;
        this.next = null;
        this.prev = null;
    }

    public setNext(d : RawLinkedListElement<T> | null) {
        this.next = d;
    }
    public setPrev(d : RawLinkedListElement<T> | null) {
        this.prev = d;
    }

    public compareTo(other : RawLinkedListElement<T>) : number {
        if(this.data == null){
            if(other.data == null){
                return 0;
            }
            else {
                return 1;
            }
        }

        return this.data.compareTo(other.data);
    }
}

export class RawLinkedListIterator<T extends IComparable> {
    private list : RawLinkedList<T>;
    private current : RawLinkedListElement<T> | null;

    constructor(list : RawLinkedList<T>){
        this.list = list;
        this.current = list.getRoot();
    }

    public hasNext() : boolean {
        return this.current != null;
    }

    public next() : T | null {
        let prevCurrent = this.current;
        this.current = this.current != null ? this.current.next : null;
        return prevCurrent != null ? prevCurrent.data : null;
    }

    public nextElement() : RawLinkedListElement<T> | null {
        let prevCurrent = this.current;
        this.current = this.current != null ? this.current.next : null;

        return prevCurrent;
    }
}
