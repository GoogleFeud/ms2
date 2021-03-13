
import { InputStream, MSError } from "./InputStream";
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

export class Parser {
    tokens: Tokenizer
    meta: Record<string, string|number|boolean|undefined>
    settings: ParserOptions
    stopped?: boolean
    constructor(settings: ParserOptions = {}) {
        this.tokens = new Tokenizer(settings);
        this.settings = settings;
        this.meta = {};
    }

    private maybeBinary(left: AST_Node|SkipParse|undefined, prec = 0) : AST_Node|SkipParse|undefined {
        if (!left || left === 1) return;
        const token = this.tokens.peek();
        if (!token || token.type !== TOKEN_TYPES.OP || !OperatorPrecedence[token.value]) return left;
        const otherPrec = OperatorPrecedence[token.value];
        if (otherPrec >= prec) {
            this.tokens.consume(); // Skip the operator
            const right = this.maybeBinary(this.parseAtom(), otherPrec);
            if (!right || right === 1) return;
            return this.maybeBinary({
                operator: token.value as string,
                type: AST_TYPES.BINARY,
                left,
                right
            }, prec);
        }
    }


    parseAtom(token = this.tokens.peek()) : AST_Node|SkipParse|undefined {
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
                if (StatementParsers[token.value]) return this.tokens.stream.error(`Unexpected ${token.value} statement. An expression was expected.`);
                this.tokens.stream.error(`Unexpected token ${token.value}`);
            }
        })();
        
        // Parses any suffixes
        // . / ?. - Property accessor
        // [ / ?[] - Property accessor
        // ( - Call
        // { - Struct instantiation
        if (!resToken || resToken === 1) return;
        return this.parseSuffix(resToken as AST_Node);
    }

    parseSuffix(token: AST_Node) : AST_Node|undefined {
        let nextToken = this.tokens.peek();
        if (!nextToken || nextToken.type !== TOKEN_TYPES.PUNC) return token;
        let optional;
        if (nextToken.value === "?") {
            this.tokens.consume();
            nextToken = this.tokens.peek();
            if (!nextToken || nextToken.type !== TOKEN_TYPES.PUNC) return this.tokens.stream.error("Unexpectd ?");
            optional = true;
        }
        switch(nextToken.value) {
        case ".": {
            const t = ExpressionParsers["a."](this, this.tokens.consume() as Token, {token, optional});
            if (!t || t === 1) return token;
            return this.parseSuffix(t);
        }
        case "[": {
            const t = ExpressionParsers["a["](this, this.tokens.consume() as Token, {token, optional});
            if (!t || t === 1) return token;
            return this.parseSuffix(t);
        }
        case "(": {
            if (optional) return this.tokens.stream.error("Unexpectd ?");
            const t = ExpressionParsers["call"](this, this.tokens.consume() as Token, token);
            if (!t || t === 1) return token;
            return this.parseSuffix(t);
        }
        case "{": {
            if (optional) return this.tokens.stream.error("Unexpectd ?");
            if (token.type !== AST_TYPES.ID) return token;
            const t = ExpressionParsers["init"](this, this.tokens.consume() as Token, token);
            if (!t || t === 1) return token;
            return this.parseSuffix(t);
        }
        default: {
            if (nextToken.value === ";") this.tokens.consume();
            if (optional) return this.tokens.stream.error("Unexpectd ?");
            return token;
        }
        }
    }

    parseExpression(token?: AST_Node) : AST_Node|SkipParse|undefined {
        return this._makeFullAST(this.maybeBinary(token || this.parseAtom()));
    }

    parseStatement() : AST_Node|SkipParse|undefined {
        const token = this.tokens.peek();
        if (token && token.type === TOKEN_TYPES.KEYWORD && StatementParsers[token.value]) return this._makeFullAST(StatementParsers[token.value](this, token));
    }

    parseAny() {
        return this._makeFullAST(this.parseStatement() || this.parseExpression());
    }

    parse(code: string) : Array<AST_Node> {
        this.tokens.prepare(code);
        const res = [];
        while (!this.tokens.isEOF() && !this.stopped) {
            const exp = this.parseStatement() || this.parseExpression(undefined);
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
        this.tokens.stream.error(error || `Expected ${val}, found ${token?.value || "nothing"}`);
        return false;
    }

    _isOfType(type: TOKEN_TYPES, val?: string) : boolean|undefined {
        const token = this.tokens.peek();
        return token && token.type === type && (!val || val === token.value);
    }

    _makeFullAST(node: AST_Node|SkipParse|undefined) : AST_Node|SkipParse|undefined {
        if (!node || node === 1) return node;
        node.col = this.tokens.stream.col;
        node.line = this.tokens.stream.line;
        return node;
    }
} 

