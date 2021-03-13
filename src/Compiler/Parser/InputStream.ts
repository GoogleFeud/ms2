
export interface LOC {
    line: number,
    col: number
}

export class InputStream {
    code: string
    pos: number
    line: number
    col: number
    constructor(code: string) {
        this.code = code;
        this.pos = 0;
        this.line = 1;
        this.col = 0;
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

    getLOC() : LOC {
        return {
            line: this.line,
            col: this.col
        };
    }

}