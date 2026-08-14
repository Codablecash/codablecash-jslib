

export class RawLinkedList<T> {
    protected root : RawLinkedListElement<T> | null;
    protected last : RawLinkedListElement<T> | null;
    protected length : number;

    constructor(){
        this.root = null;
        this.last = null;
        this.length = 0;
    }

    public getRoot() : RawLinkedListElement<T> | null {
        return this.root;
    }

}

export class RawLinkedListElement<T> {
    public data : T | null;
    public next : RawLinkedListElement<T> | null;
    public prev : RawLinkedListElement<T> | null;

    constructor(ptr : T) {
        this.data = ptr;
        this.next = null;
        this.prev = null;
    }
}

export class Iterator<T> {
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
