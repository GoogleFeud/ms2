
import { ERROR_TYPES, InputStream, MSError } from "./InputStream";
import {Token, Tokenizer, TOKEN_TYPES} from "./Tokenizer";

import ExpressionParsers from "./ElementParsers/expressions";
import StatementParsers from "./ElementParsers/statements";

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
    DEFINE,
    CONST,
    ASSIGN,
    ACCESS,
    CALL,
    LOOP,
    BLOCK,
    FN
}

export type AST_Node = AST_String|AST_Number|AST_Boolean|AST_Null|AST_Array|AST_Object|AST_Binary|AST_Not|AST_If|AST_Fn|AST_Block|AST_Access|AST_Call|SkipParse;

export interface AST_Block {
    type: AST_TYPES,
    elements: Array<AST_Node>
}

export interface AST_String {
    type: AST_TYPES
    value: string
}

export interface AST_Number {
    type: AST_TYPES
    value: number
}

export interface AST_Id {
    type: AST_TYPES
    value: string
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

export interface AST_Define {
    type: AST_TYPES,
    declarations: Array<string>,
    defineType: "let"|"const"
    initializor?: AST_Node
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

export interface AST_Fn {
    type: AST_TYPES,
    params: Array<string>,
    body: AST_Node
}

export interface AST_Access {
    type: AST_TYPES,
    start: AST_Node,
    path: Array<AST_Node>
}


export interface AST_Call {
    type: AST_TYPES,
    fn?: AST_Node,
    params: Array<AST_Node>
}

export type SkipParse = 1;

export type ElementParser = (parser: Parser, token: Token, args?: any) => AST_Node|SkipParse|undefined;

export const ExpressionElementParsers: Record<string|number, ElementParser> = ExpressionParsers;
export const StatementElementParsers: Record<string|number, ElementParser> = StatementParsers; 

export const OperatorPrecedence: Record<string, number> = {
    "=": 1,
    "||": 2,
    "&&": 3,
    "<": 7, ">": 7, "<=": 7, ">=": 7, "==": 7, "!=": 7,
    "+": 10, "-": 10,
    "*": 20, "/": 20, "%": 20,
}; 

export interface ParserOptions {
    onError?: (err: MSError, steam: InputStream) => void | undefined,
    stopAfterFirstError?: boolean
}

export const enum PARSER_CONTEXT {
    NONE,
    IF,
    LOOP,
    DECLARATION,
    ASSIGNMENT
}

export class Parser {
    tokens: Tokenizer
    code: string
    meta: Record<string, string|number|boolean|undefined>
    settings: ParserOptions
    ctx: PARSER_CONTEXT
    stopped?: boolean
    constructor(code: string, settings: ParserOptions = {}) {
        this.settings = settings;
        this.tokens = new Tokenizer(code, settings);
        this.code = code;
        this.meta = {};
        this.ctx = PARSER_CONTEXT.NONE;
    }

    reuse() : void {
        this.tokens.reuse(this.code);
        this.stopped = false;
        this.ctx = PARSER_CONTEXT.NONE;
    }

    private maybeBinary(left: AST_Node|undefined, prec = 0) : AST_Node|undefined {
        if (!left) return;
        const token = this.tokens.peek();
        if (!token || token.type !== TOKEN_TYPES.OP || !OperatorPrecedence[token.value]) return left;
        const otherPrec = OperatorPrecedence[token.value];
        if (otherPrec >= prec) {
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

    private parseAfterExp(ast: AST_Node|SkipParse|undefined) : AST_Node|SkipParse|undefined {
        if (!ast || ast === 1) return ast;
        const nextToken = this.tokens.peek();
        if (nextToken && nextToken.type === TOKEN_TYPES.PUNC && (nextToken.value === "." || nextToken.value === "[" || nextToken.value === "(") ) {
            switch(nextToken.value) {
            case ".": {
                return ExpressionElementParsers["access"](this, nextToken, ast);
            }
            case "[":
                return ExpressionElementParsers["access"](this, nextToken, ast);
            case "(":
                return this.parseAfterExp(ExpressionElementParsers["call"](this, nextToken, ast));
            default:
                return ast;
            }
        }
        return ast;
    }

    parseAtom(token = this.tokens.peek()) : AST_Node|SkipParse|undefined {
        const ast = (() => {
            if (!token) return;
            if (token.type === TOKEN_TYPES.PUNC) {
                if (token.value === ";") {
                    this.tokens.consume();
                    return;
                }
                if (token.value === "(") {
                    this.tokens.consume();
                    if (this._isOfType(TOKEN_TYPES.PUNC, ")")) { // Function with no params
                        this.tokens.consume();
                        if (this._isOfType(TOKEN_TYPES.OP, "=>")) return ExpressionElementParsers["fn"](this, token, {skippedParan: true, params: []});
                        return 1;
                    } 
                    else if (this._isOfType(TOKEN_TYPES.ID)) {
                        const id = this.tokens.consume();
                        if (!id) return;
                        if (this._isOfType(TOKEN_TYPES.PUNC, ")")) { // Function with 1 param
                            this.tokens.consume();
                            if (this._isOfType(TOKEN_TYPES.OP, "=>")) return ExpressionElementParsers["fn"](this, token, {skippedParan: true, params: [id]});
                            return ExpressionElementParsers[id.type](this, id, true);
                        } else if (this._isOfType(TOKEN_TYPES.PUNC, ",")) { // Function with more than 1 param
                            this.tokens.consume();
                            return ExpressionElementParsers["fn"](this, token, {params: [id]});
                        }
                        else {
                            const res = this.parseExpression(id as unknown as AST_Id);
                            this._expectToken(TOKEN_TYPES.PUNC, ")");
                            return res;
                        }
                    }
                    const exp = this.parseExpression();
                    this._expectToken(TOKEN_TYPES.PUNC, ")");
                    return exp;
                }
            }
            if (token.type === TOKEN_TYPES.STRING || token.type === TOKEN_TYPES.NUMBER) return this.tokens.consume() as unknown as AST_String;
            if (ExpressionElementParsers[token.value]) return ExpressionElementParsers[token.value](this, token);
            else if (ExpressionElementParsers[token.type]) return ExpressionElementParsers[token.type](this, token);
            else {
                if (StatementParsers[token.value]) return this.tokens.stream.error(ERROR_TYPES.SYNTAX, `Unexpected ${token.value} statement. An expression was expected.`);
                this.tokens.stream.error(ERROR_TYPES.SYNTAX, `Unexpected token ${token.value}`);
            }
        })();
        return this.parseAfterExp(ast);
    }

    parseExpression(token?: AST_Node) : AST_Node|SkipParse|undefined {
        return this.maybeBinary(token || this.parseAtom());
    }

    parseStatement() : AST_Node|SkipParse|undefined {
        const token = this.tokens.peek();
        if (token && token.type === TOKEN_TYPES.KEYWORD && StatementParsers[token.value]) return StatementParsers[token.value](this, token);
    }

    parse() : Array<AST_Node> {
        const res = [];
        while (!this.tokens.isEOF() && !this.stopped) {
            const exp = this.parseStatement() || this.parseExpression();
            if (!exp) {
                if (this.settings.stopAfterFirstError) return res;
                this.tokens.consume();
                continue;
            } 
            else if (exp !== 1) res.push(exp);
            if (this._isOfType(TOKEN_TYPES.PUNC, ";")) this.tokens.consume();
        }
        return res;
    }

    _expectToken(type: TOKEN_TYPES, val?: string, consume = true, error?: string) : boolean {
        const token = consume ? this.tokens.consume():this.tokens.peek();
        if (token && token.type === type && (!val || token.value === val)) return true;
        this.tokens.stream.error(ERROR_TYPES.SYNTAX, error || `Expected ${val}, found ${token?.value || "nothing"}`);
        return false;
    }

    _isOfType(type: TOKEN_TYPES, val?: string) : boolean|undefined {
        const token = this.tokens.peek();
        return token && token.type === type && (!val || val === token.value);
    }
} 