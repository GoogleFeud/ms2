
import { ElementParser } from "..";
import { AST_Id, AST_Node, AST_TYPES, AST_If } from "../ast";

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
    if (!body) return parser.tokens.stream.error("Missing function body");
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
    if (body.length === 1) return body[0];
    return {
        type: AST_TYPES.BLOCK,
        elements: body
    };
};

DefaultElementParsers["!"] = (parser) => {
    parser.tokens.consume(); // skip !
    const exp = parser.parseExpression();
    if (!exp) return parser.tokens.stream.error("Unexpected unary operator");
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

DefaultElementParsers["a."] = (parser, _, {token, optional}) => {
    if (!parser._isOfType(TOKEN_TYPES.ID)) return parser.tokens.stream.error("Expected identifier in property access chain");
    return {
        start: token as AST_Node, 
        accessor: parser.tokens.consume() as unknown as AST_Node,
        type: AST_TYPES.ACCESS,
        optional
    };
};

DefaultElementParsers["a["] = (parser, _, {token, optional}) => {
    if (parser._isOfType(TOKEN_TYPES.PUNC, "]")) return parser.tokens.stream.error("Expected expression inside property access chain");
    const exp = parser.parseExpression();
    if (exp === 1) return 1;
    parser._expectToken(TOKEN_TYPES.PUNC, "]", true, "Expected closing square bracket inside property access chain");
    return {
        start: token as AST_Node, 
        accessor: exp as AST_Node,
        type: AST_TYPES.ACCESS,
        optional
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
        else return parser.tokens.stream.error("Expected comma after field");
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
        else return parser.tokens.stream.error("Expected comma after field");
    }
    parser._expectToken(TOKEN_TYPES.PUNC, "}", true, "Missing closing bracket in struct instantiation");
    return {
        type: AST_TYPES.STRUCT_INIT,
        name: name.value,
        fields
    };
};

DefaultElementParsers["if"] = (parser) => {
    parser.tokens.consume(); // skips if
    parser._expectToken(TOKEN_TYPES.PUNC, "(", true, "Expected opening paranthesis before if condition");
    const condition = parser.parseExpression();
    if (!condition || condition === 1) return parser.tokens.stream.error("Expected expression");
    parser._expectToken(TOKEN_TYPES.PUNC, ")", true, "Expected closing paranthesis after if condition");
    const then = parser.parseExpression();
    if (!then || then === 1) return parser.tokens.stream.error("Missing if body");
    if (then.type === AST_TYPES.DEFINE) return parser.tokens.stream.error("Cannot define a variable which immediately gets freed.");
    let _else;
    if (parser._isOfType(TOKEN_TYPES.KEYWORD, "else")) {
        parser.tokens.consume();
        _else = parser.parseExpression();
        if (!_else || _else === 1) return parser.tokens.stream.error("Missing else body");
    }
    return {
        type: AST_TYPES.IF,
        condition,
        then,
        else: _else
    } as AST_If;
};


export default DefaultElementParsers;