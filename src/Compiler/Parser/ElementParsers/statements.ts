
import { ElementParser } from "..";
import { ERROR_TYPES } from "../../../util/ErrorCollector";
import { AST_Define, AST_Node, AST_TYPES } from "../ast";

import { Token, TOKEN_TYPES } from "../Tokenizer";


const DefaultElementParsers: Record<string|number, ElementParser> = {};

DefaultElementParsers["let"] = (parser, _) => {
    parser.tokens.consume(); //skip let keyword
    const final: AST_Define = {type: AST_TYPES.DEFINE, declarations: [], defineType: "let", line: _.line, col: _.col};
    let token = parser.tokens.peek();
    while (token && token.type === TOKEN_TYPES.ID) {
        final.declarations.push((parser.tokens.consume() as Token).value as string);
        if (parser._isOfType(TOKEN_TYPES.PUNC, ",")) parser.tokens.consume();
        token = parser.tokens.peek();
    }
    if (!final.declarations.length) return parser.settings.errors.create(_, ERROR_TYPES.SYNTAX, "Expected variable name in let statement");
    if (token && token.value === "=") {
        parser.tokens.consume(); // Skip = 
        const init = parser.parseExpression();
        if (!init || init === 1) return;
        final.initializor = init;
    }
    return final as AST_Node;
};

DefaultElementParsers["const"] = (parser, _) => {
    parser.tokens.consume(); //skip let keyword
    const final: AST_Define = {type: AST_TYPES.DEFINE, declarations: [], defineType: "const", line: _.line, col: _.col};
    let token = parser.tokens.peek();
    while (token && token.type === TOKEN_TYPES.ID) {
        final.declarations.push((parser.tokens.consume() as Token).value as string);
        if (parser._isOfType(TOKEN_TYPES.PUNC, ",")) parser.tokens.consume();
        token = parser.tokens.peek();
    }
    if (!final.declarations.length) return parser.settings.errors.create(_, ERROR_TYPES.SYNTAX, "Expected variable name in let statement");
    if (token && token.value === "=") {
        parser.tokens.consume(); // Skip = 
        const init = parser.parseExpression();
        if (!init || init === 1) return;
        final.initializor = init;
    }
    return final as AST_Node;
};

DefaultElementParsers["meta"] = (parser, _) => {
    parser.tokens.consume(); // skips meta
    const name = parser.tokens.consume() || {value: "", type: -1};
    if (!name || name.type !== TOKEN_TYPES.ID) parser.settings.errors.create(_, ERROR_TYPES.SYNTAX, "Invalid meta name");
    if (!parser._expectToken(_, TOKEN_TYPES.OP, "=")) return;
    const value = parser.tokens.consume();
    if (!value) return parser.settings.errors.create(_, ERROR_TYPES.SYNTAX, "Value of meta tag is required");
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
        else return parser.settings.errors.create(_, ERROR_TYPES.SYNTAX, "Meta value must be a string, a number, a boolean or null");
        break;
    default: 
        parser.settings.errors.create(_, ERROR_TYPES.SYNTAX, "Meta value must be a string, a number, a boolean or null");
    }
    return 1;
};

DefaultElementParsers["return"] = (parser, _) => {
    parser.tokens.consume();
    return {
        type: AST_TYPES.RETURN,
        value: parser.parseExpression(),
        line: _.line, 
        col: _.col
    };
};


DefaultElementParsers["struct"] = (parser, _) => {
    parser.tokens.consume(); // skips struct
    const structName = parser.tokens.consume();
    if (!structName || structName.type !== TOKEN_TYPES.ID) return parser.settings.errors.create(_, ERROR_TYPES.SYNTAX, "Expected struct name after keyword");
    parser._expectToken(_, TOKEN_TYPES.PUNC, "{", true, "Expected curly bracket after struct name");
    const fields = [];
    while (!parser._isOfType(TOKEN_TYPES.PUNC, "}")) {
        if (!parser._isOfType(TOKEN_TYPES.ID)) return parser.settings.errors.create(_, ERROR_TYPES.SYNTAX, "Expected identifier name for struct field");
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
        else parser.settings.errors.create(_, ERROR_TYPES.SYNTAX, "Expected comma after field declaration");
    }
    if (fields.length === 0) return parser.settings.errors.create(_, ERROR_TYPES.SYNTAX, "A struct must have at least one field");
    if (!parser._expectToken(_, TOKEN_TYPES.PUNC, "}", true, "Missing closing curly bracket in struct definition")) return;
    return {
        type: AST_TYPES.STRUCT,
        name: structName,
        fields,
        line: _.line, 
        col: _.col
    };
};


export default DefaultElementParsers;