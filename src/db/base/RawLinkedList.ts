import { IComparable } from "./IComparable";


type RawLinkedListCmp<T extends IComparable> = (x : RawLinkedListElement<T>, y : RawLinkedListElement<T>) => number;

function defaultCompare<T extends IComparable>(x : RawLinkedListElement<T>, y : RawLinkedListElement<T>) : number {

    return 0;
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

    public compareTo(other : RawLinkedListElement<T>) : number {
        if(this.data == null){
            if(other.data == null){
                return 0;
            }
            else {
                return 1;
            }
        }

        let d = other != null ? other.data : null;

        return this.data.compareTo(d);
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
