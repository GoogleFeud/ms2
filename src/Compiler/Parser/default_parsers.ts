
import { AST_Define, AST_Node, AST_TYPES, ElementParser } from ".";

import { ERROR_TYPES } from "./InputStream";
import { Token, TOKEN_TYPES } from "./Tokenizer";



const DefaultElementParsers: Record<string|number, ElementParser> = {};

DefaultElementParsers["let"] = (parser) => {
    parser.tokens.consume(); //skip let keyword
    const final: AST_Define = {type: AST_TYPES.DEFINE, declarations: [], defineType: "let"};
    let token = parser.tokens.peek();
    while (token && token.type === TOKEN_TYPES.ID) {
        final.declarations.push((parser.tokens.consume() as Token).value as string);
        if (parser._isOfType(TOKEN_TYPES.PUNC, ",")) parser.tokens.consume();
        token = parser.tokens.peek();
    }
    if (!final.declarations.length) return parser.tokens.stream.error(ERROR_TYPES.SYNTAX, "Expected variable name in let statement");
    if (token && token.value === "=") {
        parser.tokens.consume(); // Skip = 
        final.initializor = parser.parseExpression();
    }
    return final as AST_Node;
};

DefaultElementParsers["const"] = (parser) => {
    parser.tokens.consume(); //skip let keyword
    const final: AST_Define = {type: AST_TYPES.DEFINE, declarations: [], defineType: "const"};
    let token = parser.tokens.peek();
    while (token && token.type === TOKEN_TYPES.ID) {
        final.declarations.push((parser.tokens.consume() as Token).value as string);
        if (parser._isOfType(TOKEN_TYPES.PUNC, ",")) parser.tokens.consume();
        token = parser.tokens.peek();
    }
    if (!final.declarations.length) return parser.tokens.stream.error(ERROR_TYPES.SYNTAX, "Expected variable name in let statement");
    if (token && token.value === "=") {
        parser.tokens.consume(); // Skip = 
        final.initializor = parser.parseExpression();
    }
    return final as AST_Node;
};

DefaultElementParsers["meta"] = (parser) => {
    parser.tokens.consume(); // skips # 
    const name = parser.tokens.consume();
    if (!name || name.type !== TOKEN_TYPES.ID) return parser.tokens.stream.error(ERROR_TYPES.SYNTAX, "Invalid meta name");
    const value = parser.tokens.consume();
    if (!value) return parser.tokens.stream.error(ERROR_TYPES.SYNTAX, "Value of meta tag is required");
    switch (value.type) {
    case TOKEN_TYPES.STRING:
        parser.meta[name.value] = value.value;
        break;
    case TOKEN_TYPES.NUMBER:
        parser.meta[name.value] = value.value;
        break;
    case TOKEN_TYPES.KEYWORD:
        if (value.value === "true") parser.meta[name.value] = true;
        else if (value.value === "false") parser.meta[name.value] = false;
        else if (value.value === "null") parser.meta[name.value] = undefined;
        else return parser.tokens.stream.error(ERROR_TYPES.SYNTAX, "Meta value must be a string, a number, a boolean or null");
        break;
    default: 
        parser.tokens.stream.error(ERROR_TYPES.SYNTAX, "Meta value must be a string, a number, a boolean or null");
    }
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