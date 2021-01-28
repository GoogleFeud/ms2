

export class Enviourment {
    entries: Array<any>
    cutQueue: Array<number>
    constructor(entries?: Array<any>) {
        this.entries = entries || [];
        this.cutQueue = [];
    }

    get(key: number) : any {
        return this.entries[key];
    }

    has(key: number) : boolean {
        return key > this.entries.length;
    }

    define(value: any) : void {
        this.entries.push(value);
    }

    defineLot(values: Array<any>) : void {
        this.entries.push(...values);
    }

    cut(size: number) : void {
        this.entries.length = this.entries.length - size;
    }

    set(key: number, value: any) : void {
        this.entries[key] = value;
    }

    inc(key: number) : number {
        return ++this.entries[key];
    }

    dec(key: number) : number {
        return --this.entries[key];
    }

    
}