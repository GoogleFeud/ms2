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

export default DefaultElementParsers;