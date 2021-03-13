
import {EventEmitter} from "events";
import { LOC } from "../Compiler/Parser/InputStream";


export const enum ERROR_TYPES {
    SYNTAX,
    TYPE,
    REFERECE
}


export interface MSError extends LOC {
    type: number,
    message: string
}


export class ErrorCollector extends EventEmitter {
    errors: Array<MSError>
    constructor() {
        super();
        this.errors = [];
    }

    create(loc: LOC, type: ERROR_TYPES, message: string) : undefined {
        const obj = {...loc, type, message};
        this.errors.push(obj);
        this.emit("error", obj);
        return undefined;
    }

    reset() : void {
        this.errors = [];
        this.emit("reset");
    }

}