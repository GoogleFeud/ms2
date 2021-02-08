

export const enum ERROR_TYPES {
    SYNTAX,
    TYPE,
    REFERECE
}

const _typeToString = {
    0: "SyntaxError",
    1: "TypeError",
    2: "ReferenceError"
};

export class InputStream {
    code: string
    pos: number
    line: number
    col: number
    errors: Array<string>
    constructor(code: string) {
        this.code = code;
        this.pos = 0;
        this.line = 1;
        this.col = 0;
        this.errors = [];
    }

    consume() : string {
        const char = this.code.charAt(this.pos++);
        if (char === "\n") this.line++, this.col = 0; 
        else this.col++;
        return char;
    }

    peek(k = 0) : string {
        return this.code.charAt(this.pos + k);
    }

    isEOF() : boolean {
        return this.code.charAt(this.pos) === "";
    }

    error(type: ERROR_TYPES, msg: string) : void {
        this.errors.push(`${_typeToString[type]}: ${msg} (${this.line}:${this.col})`);
    }

}