

export class Enviourment {
    entries: Record<number, any>
    lastEntryId: number
    constructor(entries?: Record<number, any>, lastEntryId?: number) {
        this.entries = entries || {};
        this.lastEntryId = lastEntryId ?? -1;
    }

    get(key: number) : any {
        return this.entries[key];
    }

    has(key: number) : boolean {
        return key > this.lastEntryId;
    }

    define(value: any) : void {
        this.entries[++this.lastEntryId] = value;
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