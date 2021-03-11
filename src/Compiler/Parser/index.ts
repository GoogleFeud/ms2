
import { ERROR_TYPES, InputStream, MSError } from "./InputStream";
import {Token, Tokenizer, TOKEN_TYPES} from "./Tokenizer";

import ExpressionParsers from "./ElementParsers/expressions";
import StatementParsers from "./ElementParsers/statements";
import { AST_Node, SkipParse, AST_TYPES, AST_Id} from "./ast";

export type ElementParser = (parser: Parser, token: Token, args?: any) => AST_Node|SkipParse|undefined;

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


    parseAtom(token = this.tokens.peek()) : AST_Node|undefined {
        if (!token) return;
        // Parses any prefixes
        // ! - NOT
        if (token.type === TOKEN_TYPES.OP && token.value === "!") return ExpressionParsers["!"](this, token);

        // Parses the expression itself
        const resToken = (() => {
            if (!token) return;
            if (token.type === TOKEN_TYPES.PUNC) {
                switch(token.value) {
                case ";":
                    this.tokens.consume();
                    return this.parseAtom(); 
                case "{":
                    this.tokens.consume();
                    return ExpressionParsers["block"](this, token);
                case "[":
                    this.tokens.consume();
                    return ExpressionParsers["array"](this, token);
                case "(":
                    if (token.value === "(") {
                        this.tokens.consume();
                        if (this._isOfType(TOKEN_TYPES.PUNC, ")")) { // Function with no params
                            this.tokens.consume();
                            if (this._isOfType(TOKEN_TYPES.OP, "=>")) return ExpressionParsers["fn"](this, token, {skippedParan: true, params: []});
                            return 1;
                        } 
                        else if (this._isOfType(TOKEN_TYPES.ID)) {
                            const id = this.tokens.consume();
                            if (!id) return;
                            if (this._isOfType(TOKEN_TYPES.PUNC, ")")) { // Function with 1 param
                                this.tokens.consume();
                                if (this._isOfType(TOKEN_TYPES.OP, "=>")) return ExpressionParsers["fn"](this, token, {skippedParan: true, params: [id]});
                                return ExpressionParsers[id.type](this, id, true);
                            } else if (this._isOfType(TOKEN_TYPES.PUNC, ",")) { // Function with more than 1 param
                                this.tokens.consume();
                                return ExpressionParsers["fn"](this, token, {params: [id]});
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
            }
            if (token.type === TOKEN_TYPES.STRING || token.type === TOKEN_TYPES.NUMBER) return this.tokens.consume() as unknown as AST_Node;
            if (ExpressionParsers[token.value]) return ExpressionParsers[token.value](this, token);
            else if (ExpressionParsers[token.type]) return ExpressionParsers[token.type](this, token);
            else {
                if (StatementParsers[token.value]) return this.tokens.stream.error(ERROR_TYPES.SYNTAX, `Unexpected ${token.value} statement. An expression was expected.`);
                this.tokens.stream.error(ERROR_TYPES.SYNTAX, `Unexpected token ${token.value}`);
            }
        })();
        
        // Parses any suffixes
        // . - Property accessor
        // [ - Property accessor
        // ( - Call
        if (!resToken || resToken === 1) return;
        return this.parseSuffix(resToken as AST_Node);
    }

    parseSuffix(token: AST_Node) : AST_Node|undefined {
        const nextToken = this.tokens.peek();
        if (!nextToken || nextToken.type !== TOKEN_TYPES.PUNC) return token;
        switch(nextToken.value) {
        case ".": {
            const t = ExpressionParsers["a."](this, this.tokens.consume() as Token, token);
            if (!t || t === 1) return token;
            return this.parseSuffix(t);
        }
        case "[": {
            const t = ExpressionParsers["a["](this, this.tokens.consume() as Token, token);
            if (!t || t === 1) return token;
            return this.parseSuffix(t);
        }
        case "(": {
            const t = ExpressionParsers["call"](this, this.tokens.consume() as Token, token);
            if (!t || t === 1) return token;
            return this.parseSuffix(t);
        }
        case ";": {
            this.tokens.consume();
            return token;
        }
        default: return token;
        }
    }

    parseExpression(token?: AST_Node) : AST_Node|SkipParse|undefined {
        return this.maybeBinary(token || this.parseAtom());
    }

    parseStatement() : AST_Node|SkipParse|undefined {
        const token = this.tokens.peek();
        if (token && token.type === TOKEN_TYPES.KEYWORD && StatementParsers[token.value]) return StatementParsers[token.value](this, token);
    }

    parseAny() {
        return this.parseStatement() || this.parseExpression();
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