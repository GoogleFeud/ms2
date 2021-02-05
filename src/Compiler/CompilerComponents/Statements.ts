
import {Compiler, COMPILER_CONTEXT} from "../";
import { OP_CODES } from "../../Interpreter";
import { ERROR_TYPES } from "../Parser/InputStream";
import { Token, TOKEN_TYPES } from "../Parser/Tokenizer";


const Statements: Record<string, (compiler: Compiler, token: Token, ctx: COMPILER_CONTEXT) => void> = {};

Statements["export"] = (compiler, _, ctx) => {
    const name = compiler.tokens.consume();
    if (!name || name.type !== TOKEN_TYPES.ID) return compiler.tokens.stream.error(ERROR_TYPES.SYNTAX, "Expected identifier name after export keyword");
    if (compiler._consumeOp("=", "Expected equal sign (=) in export statement")) return;
    if (compiler.compileExpression() === false) return compiler.tokens.stream.error(ERROR_TYPES.SYNTAX, "Expected expression in export statement");
    if (ctx !== COMPILER_CONTEXT.GLOBAL) return compiler.tokens.stream.error(ERROR_TYPES.SYNTAX, "The export keyword can only be used in the global context");
    compiler.ctx.addOpCode(OP_CODES.EXPORT);
    compiler.ctx.addString(name.value as string, false);
};

Statements["let"] = (compiler) => {
    const listOfIds: Array<string> = [];
    let token = compiler.tokens.peek();
    while (token && token.type === TOKEN_TYPES.ID) {
        listOfIds.push((compiler.tokens.consume() as Token).value as string);
        if (compiler._isPunc(",")) compiler.tokens.consume();
        token = compiler.tokens.peek();
    }
    if (!listOfIds.length) return compiler.tokens.stream.error(ERROR_TYPES.SYNTAX, "Expected variable name in let statement");
    if (compiler._isOp("=")) {
        compiler.tokens.consume();
        if (compiler.compileExpression() === false) return compiler.tokens.stream.error(ERROR_TYPES.SYNTAX, "Expected expression in let statement");
    } else compiler.ctx.addUndefinedOp();
    for (let i = 0; i < listOfIds.length; i++) {
        const id = listOfIds[i];
        if (compiler.ctx.variableIndexes[id]) return compiler.tokens.stream.error(ERROR_TYPES.SYNTAX, `Variable ${id} is already defined`);
        compiler.ctx.variableIndexes[id] = compiler.ctx.lastVariableAddress++;
        if (i === listOfIds.length - 1) compiler.ctx.addOpCode(OP_CODES.LET_POP);
        else compiler.ctx.addOpCode(OP_CODES.LET);
    }
};

export default Statements;