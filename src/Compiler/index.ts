
import {Parser} from "./Parser";
import {CompilerContext} from "./Context";
import { AST_Binary, AST_Boolean, AST_Define, AST_Id, AST_Node, AST_Number, AST_String, AST_TYPES } from "./Parser/ast";
import { OP_CODES } from "../Interpreter";
import { ErrorCollector, ERROR_TYPES, MSError } from "../util/ErrorCollector";
import {resolveType} from "./TypeChecker/resolver";
import { compatible } from "./TypeChecker";

export interface PassdownSettings {
    stopAfterFirstError?: boolean,
    errors: ErrorCollector
}

export interface CompilerSettings { 
    stopAfterFirstError?: boolean,
    forbiddenKeywords?: Array<string>,
    bufferSize?: number
}

export class Compiler {
    settings: CompilerSettings
    parser: Parser
    ctx: CompilerContext
    errors: ErrorCollector
    constructor(options: CompilerSettings = {}) {
        this.settings = options;
        this.errors = new ErrorCollector();
        this.parser = new Parser({stopAfterFirstError: options.stopAfterFirstError, errors: this.errors});
        this.ctx = new CompilerContext(options);
    }

    compile(code: string, clearCtx = true) : Buffer|Array<MSError> {
        const parsedContent = this.parser.parse(code);
        if (this.errors.errors.length) {
            const errors = this.errors.errors;
            this.errors.reset();
            return errors;
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

    compileAST(ast: AST_Node) : true|undefined {
        if (this.errors.errors.length) return;
        switch(ast.type) {
        case AST_TYPES.NUMBER:
            this.ctx.addNumber((ast as AST_Number).value, true);
            return true;
        case AST_TYPES.STRING:
            this.ctx.addString((ast as AST_String).value, true);
            return true;
        case AST_TYPES.BOOL:
            this.ctx.addBoolOp((ast as AST_Boolean).value);
            return true;
        case AST_TYPES.NULL:
            this.ctx.addUndefinedOp();
            return true;
        case AST_TYPES.BINARY: {
            const el = ast as AST_Binary;
            switch(el.operator) {
            case "==": {
                const el = ast as AST_Binary;
                if (!compatible(resolveType(el.left, this), resolveType(el.right, this))) return this.errors.create(el, ERROR_TYPES.TYPE, "Comparison will always return false because the types of the operands are incompatible.");
                if (!this.compileAST(el.left)) return;
                if (!this.compileAST(el.right)) return;
                this.ctx.addOpCode(OP_CODES.EQUAL);
                return true;
            }
            case "+": {
                if (!this.compileAST(el.left)) return;
                if (!this.compileAST(el.right)) return;
                if (!resolveType(ast, this)) return;
                this.ctx.addOpCode(OP_CODES.ADD);
                return true;
            }
            case "-": {
                if (!this.compileAST(el.left)) return;
                if (!this.compileAST(el.right)) return;
                if (!resolveType(ast, this)) return;
                this.ctx.addOpCode(OP_CODES.SUB);
                return true;
            }
            case "*": {
                if (!this.compileAST(el.left)) return;
                if (!this.compileAST(el.right)) return;
                if (!resolveType(ast, this)) return;
                this.ctx.addOpCode(OP_CODES.MUL);
                return true;
            }
            case "/": {
                if (!this.compileAST(el.left)) return;
                if (!this.compileAST(el.right)) return;
                if (!resolveType(ast, this)) return;
                this.ctx.addOpCode(OP_CODES.DIV);
                return true;
            }
            default:
                break;
            }
            break;
        }
        case AST_TYPES.DEFINE: {
            const el = ast as AST_Define;
            const type = resolveType(el, this);
            if (el.initializor) this.compileAST(el.initializor);
            else this.ctx.addUndefinedOp();
            const declarationLen = el.declarations.length;
            for (let i=0; i < declarationLen; i++) {
                const declaration = el.declarations[i];
                if (declaration in this.ctx.variableIndexes) return this.errors.create(el, ERROR_TYPES.SYNTAX, `${declaration} has already been declared`);
                
                this.ctx.variableIndexes[declaration] = this.ctx.lastVariableAddress++;
                this.ctx.variableTypings[declaration] = type;
                if (i === declarationLen - 1) this.ctx.addOpCode(OP_CODES.LET_POP);
                else this.ctx.addOpCode(OP_CODES.LET);
            }
            return true;
        }
        case AST_TYPES.ID: {
            const elVal = (ast as AST_Id).value;
            if (this.ctx.variableIndexes[elVal] === undefined) return this.errors.create(ast, ERROR_TYPES.SYNTAX, `${elVal} is not defined`);
            this.ctx.addOpCode(OP_CODES.PUSH_VAR);
            this.ctx.addUnsigned16(this.ctx.variableIndexes[elVal]);
            return true;
        }
        }
    }

}