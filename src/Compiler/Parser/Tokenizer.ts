
import {InputStream, ERROR_TYPES, InputStreamSettings} from "./InputStream";

export const enum TOKEN_TYPES {
    STRING,
    NUMBER,
    ID,
    OP,
    KEYWORD,
    PUNC
}

export interface Token {
    type: TOKEN_TYPES,
    value: string|number
}

export const keywords = ["if", "loop", "else", "export", "meta", "let", "const", "true", "false", "null", "return", "struct"];
export const operators = ["+", "-", "*", "/", "%", "=", "&", "|", "<", ">", "!"];
export const punctuation = ["{", "}", "(", ")", "[", "]", ",", ";", ":", "."];

// You're a tokenizer baby
export class Tokenizer {
    stream: InputStream
    current?: Token
    private inMultilineComment: boolean
    settings?: InputStreamSettings
    constructor(code: string, settings?: InputStreamSettings) {
        this.stream = new InputStream(code, settings);
        this.settings = settings;
        this.inMultilineComment = false;
    }

    reuse(code: string) : void {
        this.stream = new InputStream(code, this.settings);
        this.inMultilineComment = false;
        delete this.current;
    } 

    readWhile(predicate: (ch: string) => boolean) : string {
        let str = "";
        while (!this.stream.isEOF() && predicate(this.stream.peek())) str += this.stream.consume();
        return str;
    }

    readNumber() : Token {
        let hasDot = false;
        let hasUnderscore = false;
        let num = this.readWhile((ch) => {
            if (ch === ".") {
                if (hasDot) return false;
                if (this.stream.peek(1) === "_") this.stream.error(ERROR_TYPES.SYNTAX, "Numeric separators are now allowed after decimal points");
                return hasDot = true;
            } else if (ch === "_") {
                if (hasUnderscore) {
                    this.stream.error(ERROR_TYPES.SYNTAX, "Only one underscore is allowed as numeric separator");
                    return true;
                }
                return hasUnderscore = true;
            }
            return isDigit(ch);
        });
        if (hasUnderscore) {
            if (num.endsWith("_")) this.stream.error(ERROR_TYPES.SYNTAX, "Numeric separators are not allowed at the end of numeric literals");
            num = num.replace(/_/g, "");
        }
        return {
            type: TOKEN_TYPES.NUMBER,
            value: parseFloat(num)
        };
    }

    readIdent() : Token {
        const id = this.readWhile(isId);
        return {
            type: keywords.includes(id) ? TOKEN_TYPES.KEYWORD:TOKEN_TYPES.ID,
            value: id
        };
    }

    readString() : Token {
        let escaped = false;
        let str = "";
        this.stream.consume(); // consume the "
        while (!this.stream.isEOF()) {
            const ch = this.stream.consume();
            if (escaped) {
                str += ch;
                escaped = false;
            }
            else if (ch === "\\") escaped = true;
            else if (ch === "\"") break;
            else str += ch;
        }
        return {type: TOKEN_TYPES.STRING, value: str};
    }

    processNext() : Token|undefined {
        this.readWhile(isWhitespace);
        if (this.stream.isEOF()) return;
        const char = this.stream.peek();
        if (char === "/" && this.stream.peek(1) === "/") {
            this.readWhile(ch => ch !== "\n");
            this.stream.consume(); // Skips the \n
            return this.processNext();
        }
        else if (char === "/" && this.stream.peek(1) === "*") {
            this.inMultilineComment = true;
            this.readWhile(ch => {
                if (ch === "*" && this.stream.peek(1) === "/") this.inMultilineComment = false;
                return this.inMultilineComment;
            }); 
            this.stream.consume();
            this.stream.consume();
            return this.processNext();
        }
        else if (char === "\"") return this.readString();
        else if (isDigit(char)) return this.readNumber();
        else if (isIdStart(char)) return this.readIdent();
        else if (punctuation.includes(char)) return {type: TOKEN_TYPES.PUNC, value: this.stream.consume()};
        else if (operators.includes(char)) return {type: TOKEN_TYPES.OP, value: this.readWhile((ch) => operators.includes(ch))};
        else this.stream.error(ERROR_TYPES.SYNTAX, `Unexpected token ${char}`);
    }

    peek() : Token|undefined {
        return this.current || (this.current = this.processNext());
    }

    pop(token?: Token) : void {
        this.current = token;
    } 

    consume() : Token|undefined {
        const token = this.current;
        delete this.current;
        return token || this.processNext();
    }

    isEOF() : boolean {
        return this.peek() === undefined;
    }

}

function isWhitespace(ch: string) : boolean {
    return " \t\n".includes(ch);
}

function isIdStart(ch: string) : boolean {
    return /[a-z_$]/i.test(ch);
}

function isId(ch: string) : boolean {
    return isIdStart(ch) || "?!-<>=0123456789".indexOf(ch) >= 0;
}

function isDigit(ch: string) : boolean {
    return /[0-9]/i.test(ch);
}