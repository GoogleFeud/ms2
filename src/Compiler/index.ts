
import {Parser, ParserOptions} from "./Parser";
import {CompilerContext} from "./Context";
import {TypeChecker} from "./TypeChecker";
import { ERROR_TYPES, MSError } from "./Parser/InputStream";
import { AST_Binary, AST_Boolean, AST_Define, AST_Id, AST_Node, AST_Number, AST_String, AST_TYPES } from "./Parser/ast";
import { DEFAULT_TYPING_IDS, TypingResolvable} from "./TypeChecker/types";
import { OP_CODES } from "../Interpreter";

export interface CompilerSettings extends ParserOptions {
    forbiddenKeywords?: Array<string>,
    bufferSize?: number
}

export class Compiler {
    settings: CompilerSettings
    parser: Parser
    types: TypeChecker
    ctx: CompilerContext
    private errors: Array<MSError>
    constructor(options: CompilerSettings = {}) {
        this.settings = options;
        this.parser = new Parser(options);
        this.types = new TypeChecker();
        this.ctx = new CompilerContext(options);
        this.errors = [];
    }

    compile(code: string, clearCtx = true) : Buffer|Array<MSError> {
        const parsedContent = this.parser.parse(code);
        if (this.parser.tokens.stream.errors.length) {
            const errs = this.parser.tokens.stream.errors;
            this.parser.tokens.stream.errors = [];
            return errs;
        }
        for (const ast of parsedContent) {
            if (!ast) continue;
            this.compileAST(ast);
        }
        const res = this.ctx.result.slice(0, this.ctx.offset);
        res.writeUInt16BE(this.ctx.lastVariableAddress);
        if (clearCtx) this.ctx.reuse(this.settings);
        return res;
    }

    compileAST(ast: AST_Node) : TypingResolvable {
        if (this.errors.length) return DEFAULT_TYPING_IDS.UNKNOWN;
        switch(ast.type) {
        case AST_TYPES.NUMBER:
            this.ctx.addNumber((ast as AST_Number).value, true);
            return DEFAULT_TYPING_IDS.NUMBER;
        case AST_TYPES.STRING:
            this.ctx.addString((ast as AST_String).value, true);
            return DEFAULT_TYPING_IDS.STRING;
        case AST_TYPES.BOOL:
            this.ctx.addBoolOp((ast as AST_Boolean).value);
            return DEFAULT_TYPING_IDS.BOOLEAN;
        case AST_TYPES.NULL:
            this.ctx.addUndefinedOp();
            return DEFAULT_TYPING_IDS.NULL;
        case AST_TYPES.BINARY: {
            const el = ast as AST_Binary;
            switch(el.operator) {
            case "==":
                if (!this.types.compatible(this.compileAST(el.left), this.compileAST(el.right))) return this._error(el, ERROR_TYPES.TYPE, "Comparison will always return false because the types of the operands are incompatible.");
                this.ctx.addOpCode(OP_CODES.EQUAL);
                return DEFAULT_TYPING_IDS.BOOLEAN;
            case "+": {
                const leftType = this.compileAST(el.left);
                const rightType = this.compileAST(el.right);
                const isLeftString = this.types.is(leftType, DEFAULT_TYPING_IDS.STRING);
                const isRightString = this.types.is(rightType, DEFAULT_TYPING_IDS.STRING);
                if ((!isLeftString && !this.types.is(leftType, DEFAULT_TYPING_IDS.NUMBER)) || (!isRightString && !this.types.is(rightType, DEFAULT_TYPING_IDS.NUMBER))) return this._error(el, ERROR_TYPES.TYPE, "Cannot add values different than strings or numbers");
                this.ctx.addOpCode(OP_CODES.ADD);
                return isLeftString || isRightString ? DEFAULT_TYPING_IDS.STRING:DEFAULT_TYPING_IDS.NUMBER;
            }
            default:
                return DEFAULT_TYPING_IDS.UNKNOWN;
            }
        }
        case AST_TYPES.DEFINE: {
            const el = ast as AST_Define;
            const type: TypingResolvable = {};
            if (el.defineType === "const") type.readonly = true;
            else if (el.defineType === "let" && !el.initializor) type.nullable = true;
            if (el.initializor) {
                const valType = this.compileAST(el.initializor);
                type.extends = valType;
            }
            else this.ctx.addUndefinedOp();
            const declarationLen = el.declarations.length;
            for (let i=0; i < declarationLen; i++) {
                const declaration = el.declarations[i];
                if (declaration in this.ctx.variableIndexes) return this._error(el, ERROR_TYPES.SYNTAX, `${declaration} has already been declared`);
                
                this.ctx.variableIndexes[declaration] = this.ctx.lastVariableAddress++;
                this.ctx.variableTypings[declaration] = type;
                if (i === declarationLen - 1) this.ctx.addOpCode(OP_CODES.LET_POP);
                else this.ctx.addOpCode(OP_CODES.LET);
            }
            return DEFAULT_TYPING_IDS.UNKNOWN;
        }
        case AST_TYPES.ID: {
            const elVal = (ast as AST_Id).value;
            if (this.ctx.variableIndexes[elVal] === undefined) return this._error(ast, ERROR_TYPES.SYNTAX, `${elVal} is not defined`);
            this.ctx.addOpCode(OP_CODES.PUSH_VAR);
            this.ctx.addUnsigned16(this.ctx.variableIndexes[elVal]);
            return this.ctx.variableTypings[elVal];
        }
        }
        return DEFAULT_TYPING_IDS.UNKNOWN;
    }

    private _error(ast: AST_Node, type: ERROR_TYPES, message: string) : TypingResolvable {
        const err = {type, message, line: ast.line || 0, col: ast.col || 0};
        this.errors?.push(err);
        if (this.settings.onError) this.settings.onError(err, this.parser.tokens.stream);
        return DEFAULT_TYPING_IDS.UNKNOWN;
    }

}