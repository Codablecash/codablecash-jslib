

export class BigInteger {
    private value : bigint;

    constructor(val : bigint){
        this.value = BigInt(val);
    }

    public getValue() : bigint {
        return this.value;
    }

    public add(val : BigInteger) : BigInteger {
        let ans : bigint = this.value + val.value;
        return new BigInteger(ans);
    }
    public subtract(val : BigInteger) : BigInteger {
        let ans : bigint = this.value - val.value;
        return new BigInteger(ans);
    }
    public multiply(val : BigInteger) {
       let ans : bigint = this.value * val.value;
        return new BigInteger(ans);
    }
    public divide(val : BigInteger) : BigInteger {
        let ans : bigint = this.value / val.value;
        return new BigInteger(ans);
    }
    public pow(exp : bigint) : BigInteger {
        let ans = this.value ** exp;
        return new BigInteger(ans);
    }
    public modPow(exponent : BigInteger, mod : BigInteger) : BigInteger {
        if (mod.value === 1n){
            return new BigInteger(0n);
        }
        let res = 1n;
        let base = this.value % mod.value;
        let exp = exponent.value;

        while (exp > 0n) {
            if (exp % 2n === 1n){
                res = (res * base) % mod.value;
            }
            base = (base * base) % mod.value;
            exp = exp / 2n;
        }
        return new BigInteger(res);
    }
    public mod(mod : BigInteger) : BigInteger {
         let res = this.value % mod.value;
         return new BigInteger(res);
    }
    public modInverse(val : BigInteger) : BigInteger {
        if (val.value === 1n) return new BigInteger(0n);

        let m = val.value;
        let m0 = m;
        let y = 0n, x = 1n;
        let a = this.value;

        while (a > 1n) {
             if (m === 0n) throw new Error("Division by zero");
             let q = a / m;
             let t = m;

             m = a % m;
             a = t;
             t = y

             y = x - q * y;
             x = t;
        }

        if(x < 0n){x += m0;}

        if (a !== 1n) throw new Error("Modular inverse does not exist");

        return new BigInteger(x);
    }

    public compareTo(x : BigInteger) : number {
        return this.value === x.value ? 0 : (this.value > x.value ? 1 : -1);
    }

    public equals(x : BigInteger) : boolean {
        return this.compareTo(x) === 0;
    }
}