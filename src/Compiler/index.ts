
import {Token, Tokenizer, TOKEN_TYPES} from "./Parser/Tokenizer";
import {CompilerContext, ICompilerSettings} from "./Context";
import { ERROR_TYPES } from "./Parser/InputStream";
import { OP_CODES } from "../Interpreter";
import Statements from "./CompilerComponents/Statements";
import Expressions from "./CompilerComponents/Expressions";

export const enum COMPILER_CONTEXT {
    GLOBAL,
    FUNCTION,
    INNER_FUNCTION,
    LOOP,
    INNER_LOOP,
    FUNCTION_PARAMS,
    UNKNOWN
}


export class Compiler {
    tokens: Tokenizer
    ctx: CompilerContext
    constructor(code: string, settings?: ICompilerSettings) {
        this.tokens = new Tokenizer(code);
        this.ctx = new CompilerContext(settings);
    }

    reuse(code: string, settings?: ICompilerSettings) {
        this.ctx = new CompilerContext(settings);
        this.tokens.reuse(code);
    } 

    compileExpression(token: Token|undefined = this.tokens.consume(), context = COMPILER_CONTEXT.UNKNOWN) : false|undefined {
        if (!token) return;
        else if (token.type === TOKEN_TYPES.PUNC && token.value === ";") return;
        else if (token.type === TOKEN_TYPES.NUMBER) this.ctx.addNumber(token.value as number, true);
        else if (token.type === TOKEN_TYPES.STRING) this.ctx.addString(token.value as string, true);
        else if (token.type === TOKEN_TYPES.KEYWORD && (token.value === "true" || token.value === "false")) this.ctx.addBoolOp(token.value === "true");
        else if (token.type === TOKEN_TYPES.KEYWORD && token.value === "null") this.ctx.addUndefinedOp();
        else if (Expressions[token.type]) Expressions[token.type](this, token, context);
        else if (Expressions[token.value]) Expressions[token.value](this, token, context);
        else return false;
    }

    compileStatement(token: Token|undefined = this.tokens.peek(), context = COMPILER_CONTEXT.UNKNOWN) : false|undefined {
        if (!token) return;
        if (token.type === TOKEN_TYPES.KEYWORD && Statements[token.value]) Statements[token.value](this, token, context);
        else return false;
    }


    compile() : Buffer {
        const numberOfVariablesOffset = this.ctx.skip(2);
        while (!this.tokens.isEOF()) {
            const token = this.tokens.consume();
            if (token && this.compileExpression(token, COMPILER_CONTEXT.GLOBAL) === false && this.compileStatement(token, COMPILER_CONTEXT.GLOBAL) === false) this.tokens.stream.error(ERROR_TYPES.SYNTAX, `Unexpected token ${token.value}`);
        }
        this.ctx.result.writeUInt16BE(this.ctx.lastVariableAddress, numberOfVariablesOffset);
        this.ctx.addOpCode(OP_CODES.END);

        return this.ctx.result;
    }

    _isOp(op?: string) : boolean {
        const token = this.tokens.peek();
        return token !== undefined && token.type === TOKEN_TYPES.OP && (!op || op === token.value);
    }

    _isPunc(punc?: string) : boolean {
        const token = this.tokens.peek();
        return token !== undefined && token.type === TOKEN_TYPES.PUNC && (!punc || punc === token.value);
    }

    _consumeOp(op: string, error?: string) : boolean {
        const token = this.tokens.consume();
        if (!token || token.type !== TOKEN_TYPES.OP || token.value !== op) {
            this.tokens.stream.error(ERROR_TYPES.SYNTAX, error || `Expected token ${op}`);
            return true;
        }
        return false;
    }

}