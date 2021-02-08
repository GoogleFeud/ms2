
import { ERROR_TYPES } from "./InputStream";
import {Tokenizer, TOKEN_TYPES} from "./Tokenizer";

export const enum AST_TYPES {
    STRING,
    NUMBER,
    ID,
    BOOL,
    NULL,
    ARRAY,
    OBJ,
    BINARY,
    NOT,
    IF,
    LET,
    CONST,
    ASSIGN,
    LOOP
}

export type AST_Node = AST_String|AST_Number|AST_Boolean|AST_Null|AST_Array|AST_Object|AST_Binary|AST_Not|AST_If;

export type AST_Block = Array<AST_Node>;

export interface AST_String {
    type: AST_TYPES
    value: string
}

export interface AST_Number{
    type: AST_TYPES
    value: number
}

export interface AST_Boolean {
    type: AST_TYPES
    value: boolean
}

export interface AST_Null {
    type: AST_TYPES.NULL
}

export interface AST_Array {
    type: AST_TYPES
    values: Array<AST_Node>
}

export interface AST_Object {
    type: AST_TYPES
    values: Record<string, AST_Node>
}

export interface AST_Binary {
    type: AST_TYPES,
    left: AST_Node,
    right: AST_Node,
    operator: string
}

export interface AST_Not {
    type: AST_TYPES
    expression: AST_Node
}

export interface AST_If {
    type: AST_TYPES,
    condition: AST_Node,
    then: AST_Block,
    else?: AST_Block
}

export const ElementParsers: Record<string|number, (parser: Parser) => AST_Node> = {}; 

export const OperatorPrecedence: Record<string, number> = {
    "=": 1,
    "||": 2,
    "&&": 3,
    "<": 7, ">": 7, "<=": 7, ">=": 7, "==": 7, "!=": 7,
    "+": 10, "-": 10,
    "*": 20, "/": 20, "%": 20,
}; 


export class Parser {
    tokens: Tokenizer
    code: string
    constructor(code: string) {
        this.tokens = new Tokenizer(code);
        this.code = code;
    }

    reuse() : void {
        this.tokens.reuse(this.code);
    }

    private maybeCall(fn: () => AST_Node|undefined) : AST_Node|undefined {
        const res = fn();
        return this._isOfType(TOKEN_TYPES.PUNC, "(") ? ElementParsers["call"](this) : res;
    }

    private maybeBinary(left: AST_Node|undefined, prec = 0) : AST_Node|undefined {
        if (!left) return;
        const token = this.tokens.peek();
        if (!token || token.type !== TOKEN_TYPES.OP || !OperatorPrecedence[token.value]) return left;
        const otherPrec = OperatorPrecedence[token.value];
        if (otherPrec > prec) {
            this.tokens.consume(); // Skip the operator
            const right = this.maybeBinary(this.parseAtom(), otherPrec);
            if (!right) return;
            return this.maybeBinary({
                operator: token.value as string,
                type: AST_TYPES.BINARY,
                left,
                right
            }, prec);
        }
    }

    private parseAtom() : AST_Node|undefined {
        return this.maybeCall(() => {
            const token = this.tokens.peek();
            if (!token) return;
            if (token.type === TOKEN_TYPES.PUNC && token.value === "(") {
                this.tokens.consume();
                const exp = this.parseExpression();
                this._expectToken(TOKEN_TYPES.PUNC, ")", undefined, true);
                return exp;
            }
            if (token.type === TOKEN_TYPES.STRING || token.type === TOKEN_TYPES.NUMBER || token.type === TOKEN_TYPES.ID) return this.tokens.consume() as unknown as AST_String;
            if (ElementParsers[token.value]) return ElementParsers[token.value](this);
        });
    }

    parseExpression() : AST_Node|undefined {
        return this.maybeCall(() => {
            return this.maybeBinary(this.parseAtom());
        });
    }

    parse() : AST_Block {
        const res = [];
        while (!this.tokens.isEOF()) {
            const exp = this.parseExpression();
            if (!exp) break;
            res.push(exp);
            if (this._isOfType(TOKEN_TYPES.PUNC, ";")) this.tokens.consume();
        }
        return res as AST_Block;
    }

    _expectToken(type: TOKEN_TYPES, val?: string, error?: string, consume = false) : void {
        const token = consume ? this.tokens.consume():this.tokens.peek();
        if (token && token.type !== type && (!val || val === token.value)) this.tokens.stream.error(ERROR_TYPES.SYNTAX, error || `Expected ${val}`);
    }

    _isOfType(type: TOKEN_TYPES, val?: string) : boolean|undefined {
        const token = this.tokens.peek();
        return token && token.type !== type && (!val || val === token.value);
    }
} 