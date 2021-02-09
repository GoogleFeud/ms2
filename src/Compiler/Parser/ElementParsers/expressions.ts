
import { AST_Id, AST_TYPES, ElementParser } from "../";

import { ERROR_TYPES } from "../InputStream";
import { Token, TOKEN_TYPES } from "../Tokenizer";

const DefaultElementParsers: Record<string|number, ElementParser> = {};

DefaultElementParsers["fn"] = (parser, _, args) => {
    const params: Array<string> = args.params.map((arg: Token) => arg.value as string) || [];
    let token = parser.tokens.peek();
    if (!token) return;
    if (!args.skippedParan && token.type === TOKEN_TYPES.ID) {
        while (token && token.type === TOKEN_TYPES.ID) {
            params.push((parser.tokens.consume() as Token).value as string);
            if (parser._isOfType(TOKEN_TYPES.PUNC, ",")) parser.tokens.consume();
            token = parser.tokens.peek();
        }
        parser._expectToken(TOKEN_TYPES.PUNC, ")");
        args.skippedParan = true;
    }
    if (args.skippedParan) parser._expectToken(TOKEN_TYPES.OP, "=>");
    const body = parser.parseExpression();
    if (!body) return parser.tokens.stream.error(ERROR_TYPES.SYNTAX, "Missing function body");
    return {
        type: AST_TYPES.FN,
        params,
        body
    };
};

DefaultElementParsers["!"] = (parser) => {
    parser.tokens.consume(); // skip !
    const exp = parser.parseExpression();
    if (!exp) return parser.tokens.stream.error(ERROR_TYPES.SYNTAX, "Unexpected unary operator");
    return {type: AST_TYPES.NOT, expression: exp};
};

DefaultElementParsers["true"] = () => {
    return {type: AST_TYPES.BOOL, value: true};
};

DefaultElementParsers["false"] = () => {
    return {type: AST_TYPES.BOOL, value: false};
};

DefaultElementParsers["null"] = () => {
    return {type: AST_TYPES.NULL};
};

DefaultElementParsers[TOKEN_TYPES.ID] = (parser, token, hasBeenConsumed) => {
    return (hasBeenConsumed ? token:parser.tokens.consume()) as unknown as AST_Id;
};

export default DefaultElementParsers;