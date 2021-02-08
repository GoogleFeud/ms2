
import { AST_TYPES, ElementParser } from "../";

import { ERROR_TYPES } from "../InputStream";

const DefaultElementParsers: Record<string|number, ElementParser> = {};

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

export default DefaultElementParsers;