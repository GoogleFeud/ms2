
import { ElementParser } from "..";
import { AST_Define, AST_Node, AST_TYPES } from "../ast";

import { Token, TOKEN_TYPES } from "../Tokenizer";


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
    if (!final.declarations.length) return parser.tokens.stream.error("Expected variable name in let statement");
    if (token && token.value === "=") {
        parser.tokens.consume(); // Skip = 
        const init = parser.parseExpression();
        if (!init || init === 1) return;
        final.initializor = init;
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
    if (!final.declarations.length) return parser.tokens.stream.error("Expected variable name in let statement");
    if (token && token.value === "=") {
        parser.tokens.consume(); // Skip = 
        const init = parser.parseExpression();
        if (!init || init === 1) return;
        final.initializor = init;
    }
    return final as AST_Node;
};

DefaultElementParsers["meta"] = (parser) => {
    parser.tokens.consume(); // skips meta
    const name = parser.tokens.consume() || {value: "", type: -1};
    if (!name || name.type !== TOKEN_TYPES.ID) parser.tokens.stream.error("Invalid meta name");
    if (!parser._expectToken(TOKEN_TYPES.OP, "=")) return;
    const value = parser.tokens.consume();
    if (!value) return parser.tokens.stream.error("Value of meta tag is required");
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
        else return parser.tokens.stream.error("Meta value must be a string, a number, a boolean or null");
        break;
    default: 
        parser.tokens.stream.error("Meta value must be a string, a number, a boolean or null");
    }
    return 1;
};

DefaultElementParsers["return"] = (parser) => {
    parser.tokens.consume();
    return {
        type: AST_TYPES.RETURN,
        value: parser.parseExpression()
    };
};


DefaultElementParsers["struct"] = (parser) => {
    parser.tokens.consume(); // skips struct
    const structName = parser.tokens.consume();
    if (!structName || structName.type !== TOKEN_TYPES.ID) return parser.tokens.stream.error("Expected struct name after keyword");
    parser._expectToken(TOKEN_TYPES.PUNC, "{", true, "Expected curly bracket after struct name");
    const fields = [];
    while (!parser._isOfType(TOKEN_TYPES.PUNC, "}")) {
        if (!parser._isOfType(TOKEN_TYPES.ID)) return parser.tokens.stream.error("Expected identifier name for struct field");
        let optional;
        const fieldName = (parser.tokens.consume() as Token).value;
        if (parser._isOfType(TOKEN_TYPES.PUNC, "?")) {
            parser.tokens.consume();
            optional = true;
        }
        if (parser._isOfType(TOKEN_TYPES.OP, "=")) {
            parser.tokens.consume();
            const defaultValue = parser.parseExpression();
            if (!defaultValue || defaultValue === 1) return;
            fields.push({name: fieldName, defaultValue, optional});
        } else fields.push({name: fieldName, optional});
        if (parser._isOfType(TOKEN_TYPES.PUNC, "}")) break;
        else if (parser._isOfType(TOKEN_TYPES.PUNC, ",")) parser.tokens.consume();
        else parser.tokens.stream.error("Expected comma after field declaration");
    }
    if (fields.length === 0) return parser.tokens.stream.error("A struct must have at least one field");
    if (!parser._expectToken(TOKEN_TYPES.PUNC, "}", true, "Missing closing curly bracket in struct definition")) return;
    return {
        type: AST_TYPES.STRUCT,
        name: structName,
        fields
    };
};


export default DefaultElementParsers;