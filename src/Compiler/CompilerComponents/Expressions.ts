import {Compiler, COMPILER_CONTEXT} from "../";
//import { OP_CODES } from "../../Interpreter";
import { ERROR_TYPES } from "../Parser/InputStream";
import { Token, TOKEN_TYPES } from "../Parser/Tokenizer";


const Expressions: Record<string|number, (compiler: Compiler, token: Token, ctx: COMPILER_CONTEXT) => void> = {};

Expressions[TOKEN_TYPES.ID] = (compiler, token) => {
    if (compiler.ctx.variableIndexes[token.value as string] === undefined) return compiler.tokens.stream.error(ERROR_TYPES.REFERECE, `${token.value} is not defined`);
};

export default Expressions;