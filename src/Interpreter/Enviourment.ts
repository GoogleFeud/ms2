

export class Enviourment {
    entries: Record<number, any>
    constructor(entries?: Record<number, any>) {
        this.entries = entries || {};
    }

    get(key: number) : any {
        return this.entries[key];
    }

    has(key: number) : boolean {
        if (key in this.entries) return true;
        return false;
    }

    define(key: number, value: any) : void {
        this.entries[key] = value;
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