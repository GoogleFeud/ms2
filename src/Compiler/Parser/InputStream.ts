

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

export interface InputStreamSettings {
    prettyPrint?: boolean
}


export class InputStream {
    code: string
    pos: number
    line: number
    col: number
    errors: Array<string>
    settings: InputStreamSettings
    constructor(code: string, settings: InputStreamSettings = {}) {
        this.settings = settings;
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

    error(type: ERROR_TYPES, msg: string) : undefined {
        if (!this.settings.prettyPrint) {
            this.errors.push(`${_typeToString[type]}: ${msg} (${this.line}:${this.col})`);
            return undefined;
        }
        const line = this.code.split("\n")[this.line - 1];
        let col = "";
        for (let i=0; i < this.col - 1; i++) col += " ";
        col += "^";
        this.errors.push(`${line}\n\n${col}\n${_typeToString[type]}: ${msg} (${this.line}:${this.col})`);
        return undefined;
    }

}