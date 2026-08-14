import { IComparable } from "./IComparable";

export class Integer implements IComparable {
    private value : number;

    constructor(value : number) {
        this.value = value;
    }

    public getValue() : number {
        return this.value;
    }

    public compareTo(other : IComparable | null) : number{
        if(other != null){
            return this.value - (other as Integer).value;
        }
        
        return 1;        
    }
}
