

export const enum ERROR_TYPES {
    SYNTAX,
    TYPE,
    REFERECE
}

export interface InputStreamSettings {
    onError?: (err: MSError, stream: InputStream) => void
}

export interface MSError {
    type: number,
    message: string,
    line: number,
    col: number
}

export class InputStream {
    code: string
    pos: number
    line: number
    col: number
    errors: Array<MSError>
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

    error(msg: string) : undefined {
        const err: MSError = {type: ERROR_TYPES.SYNTAX, message: msg, line: this.line, col: this.col};
        if (this.settings.onError) this.settings.onError(err, this);
        this.errors.push(err);
        return undefined;
    }

}