
import { ElementParser } from "..";
import { AST_Id, AST_Node, AST_TYPES } from "../ast";

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
    if (args.skippedParan) parser._expectToken(TOKEN_TYPES.OP, "=>", true, "Expected arrow (=>)");
    const body = parser.parseExpression();
    if (!body) return parser.tokens.stream.error(ERROR_TYPES.SYNTAX, "Missing function body");
    return {
        type: AST_TYPES.FN,
        params,
        body
    };
};

DefaultElementParsers["block"] = (parser) => {
    let token = parser.tokens.peek();
    const body = [];
    while(token && token.type !== TOKEN_TYPES.PUNC && token.value !== "}") {
        const ast = parser.parseAny();
        if (!ast || ast === 1) break;
        body.push(ast);
        token = parser.tokens.peek();
    }
    parser._expectToken(TOKEN_TYPES.PUNC, "}", true, "Expected closing curly bracket of code block");
    if (body.length === 1 && body[0].type !== AST_TYPES.DEFINE) return body[0];
    return {
        type: AST_TYPES.BLOCK,
        elements: body
    };
};

DefaultElementParsers["!"] = (parser) => {
    parser.tokens.consume(); // skip !
    const exp = parser.parseExpression();
    if (!exp) return parser.tokens.stream.error(ERROR_TYPES.SYNTAX, "Unexpected unary operator");
    return {type: AST_TYPES.NOT, expression: exp};
};

DefaultElementParsers["true"] = (parser) => {
    parser.tokens.consume();
    return {type: AST_TYPES.BOOL, value: true};
};

DefaultElementParsers["false"] = (parser) => {
    parser.tokens.consume();
    return {type: AST_TYPES.BOOL, value: false};
};

DefaultElementParsers["null"] = (parser) => {
    parser.tokens.consume();
    return {type: AST_TYPES.NULL};
};

DefaultElementParsers[TOKEN_TYPES.ID] = (parser, token, hasBeenConsumed) => {
    return (hasBeenConsumed ? token:parser.tokens.consume()) as unknown as AST_Id;
};

DefaultElementParsers["a."] = (parser, _, left) => {
    if (!parser._isOfType(TOKEN_TYPES.ID)) return parser.tokens.stream.error(ERROR_TYPES.SYNTAX, "Expected identifier in property access chain");
    return {
        start: left as AST_Node, 
        accessor: parser.tokens.consume() as unknown as AST_Node,
        type: AST_TYPES.ACCESS
    };
};

DefaultElementParsers["a["] = (parser, _, left) => {
    if (parser._isOfType(TOKEN_TYPES.PUNC, "]")) return parser.tokens.stream.error(ERROR_TYPES.SYNTAX, "Expected expression inside property access chain");
    const exp = parser.parseExpression();
    if (exp === 1) return 1;
    parser._expectToken(TOKEN_TYPES.PUNC, "]", true, "Expected closing square bracket inside property access chain");
    return {
        start: left as AST_Node, 
        accessor: exp as AST_Node,
        type: AST_TYPES.ACCESS
    };
};

DefaultElementParsers["call"] = (parser, _, left) => {
    const params: Array<AST_Node> = [];
    while (!parser._isOfType(TOKEN_TYPES.PUNC, ")")) {
        params.push(parser.parseExpression() as unknown as AST_Node);
        if (parser._isOfType(TOKEN_TYPES.PUNC, ",")) parser.tokens.consume();
        else break;
    }
    if (!parser._expectToken(TOKEN_TYPES.PUNC, ")", true, "Missing closing paranthesis in function call")) return;
    return {
        fn: left,
        type: AST_TYPES.CALL,
        params
    };
};

DefaultElementParsers["array"] = (parser) => {
    const els = [];
    while (!parser._isOfType(TOKEN_TYPES.PUNC, "]")) {
        els.push(parser.parseExpression() as unknown as AST_Node);
        if (parser._isOfType(TOKEN_TYPES.PUNC, "]")) break;
        else if (parser._isOfType(TOKEN_TYPES.PUNC, ",")) parser.tokens.consume();
        else return parser.tokens.stream.error(ERROR_TYPES.SYNTAX, "Expected comma after field");
    }
    if (!parser._expectToken(TOKEN_TYPES.PUNC, "]", true, "Missing closing square bracket in array expression")) return;
    return {
        type: AST_TYPES.ARRAY,
        elements: els
    };
};

DefaultElementParsers["init"] = (parser, _, name) => {
    const fields = [];
    let currentPair = [];
    while (!parser._isOfType(TOKEN_TYPES.PUNC, "}")) {
        currentPair[0] = (parser.tokens.consume() as Token).value;
        if (parser._isOfType(TOKEN_TYPES.PUNC, ":")) {
            parser.tokens.consume();
            currentPair[1] = parser.parseExpression();
            if (!currentPair[1] || currentPair[1] === 1) return;
            fields.push(currentPair);
            currentPair = [];
        } else fields.push(currentPair);
        currentPair = [];
        if (parser._isOfType(TOKEN_TYPES.PUNC, "}")) break;
        else if (parser._isOfType(TOKEN_TYPES.PUNC, ",")) parser.tokens.consume();
        else return parser.tokens.stream.error(ERROR_TYPES.SYNTAX, "Expected comma after field");
    }
    parser._expectToken(TOKEN_TYPES.PUNC, "}", true, "Missing closing bracket in struct instantiation");
    return {
        type: AST_TYPES.STRUCT_INIT,
        name: name.value,
        fields
    };
};


export default DefaultElementParsers;