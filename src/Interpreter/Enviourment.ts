

export class Enviourment {
    parent?: Enviourment
    entries: Record<number, any>
    constructor(parent?: Enviourment) {
        this.parent = parent;
        this.entries = {};
    }

    get(key: number) : any {
        if (this.entries[key]) return this.entries[key];
        if (!this.parent) throw `${key} is not defined!`;
        return this.parent.get(key);
    }

    has(key: number) : boolean {
        if (this.entries[key]) return true;
        if (!this.parent) return false;
        return this.parent.get(key);
    }

    define(key: number, value: any) : void {
        if (this.has(key)) throw `${key} is already defined!`;
        this.entries[key] = value;
    }

    set(key: number, value: any) : void {
        if (!this.has(key)) throw `${key} is not defined!`;
        this.entries[key] = value;
    }

    
}