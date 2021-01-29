

export class Enviourment extends Array {
    constructor() {
        super();
    }

    get(key: number) : any {
        return this[key];
    }

    has(key: number) : boolean {
        return key > this.length;
    }

    define(value: any) : void {
        this.push(value);
    }

    defineLot(values: Array<any>) : void {
        this.push(...values);
    }

    set(key: number, value: any) : void {
        this[key] = value;
    }

    inc(key: number) : number {
        return ++this[key];
    }

    dec(key: number) : number {
        return --this[key];
    }

    
}