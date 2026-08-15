import { MinusToken } from "typescript";


export class LongRange {
    private min : number;
    private max : number;

    constructor(min : number, max : number) {
        this.min = min;
        this.max = max;
    }
}