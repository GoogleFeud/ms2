import { compatible, is, resolve } from ".";
import { Compiler } from "..";
import { ERROR_TYPES } from "../../util/ErrorCollector";
import { AST_Binary, AST_Define, AST_Id, AST_Node, AST_TYPES } from "../Parser/ast";
import { TypingResolvable, TYPING_IDS } from "./types";


export function resolveType(node: AST_Node, compiler: Compiler) : TypingResolvable {
    switch(node.type) {
    case AST_TYPES.STRING:
        return TYPING_IDS.STRING;
    case AST_TYPES.NUMBER:
        return TYPING_IDS.NUMBER;
    case AST_TYPES.NULL:
        return TYPING_IDS.NULL;
    case AST_TYPES.BOOL:
        return TYPING_IDS.BOOLEAN;
    case AST_TYPES.ARRAY:
        return TYPING_IDS.ARRAY;
    case AST_TYPES.FN:
        return TYPING_IDS.FUNCTION;
    case AST_TYPES.NOT:
        return TYPING_IDS.BOOLEAN;
    case AST_TYPES.ID:
        return compiler.ctx.variableTypings[(node as AST_Id).value];
    case AST_TYPES.BINARY: {
        const ast = node as AST_Binary;
        const leftType = resolve(resolveType(ast.left, compiler));
        const rightType = resolve(resolveType(ast.right, compiler));
        if (!leftType || !rightType) return compiler.errors.create(ast, ERROR_TYPES.TYPE, "Incompatible types");
        if (leftType.nullable) return compiler.errors.create(ast.left, ERROR_TYPES.TYPE, "Right hand-side is possibly null");
        if (rightType.nullable) return compiler.errors.create(ast.right, ERROR_TYPES.TYPE, "Right hand-side is possibly null");
        switch(ast.operator) {
        case "==":
            if (!compatible(resolveType(ast.left, compiler), resolveType(ast.right, compiler))) return compiler.errors.create(ast, ERROR_TYPES.TYPE, "Comparison will always return false because the types of the operands are incompatible.");
            return TYPING_IDS.BOOLEAN;
        case "+": {
            const isLeftString = is(leftType, TYPING_IDS.STRING);
            const isRightString = is(rightType, TYPING_IDS.STRING);
            if ((!isLeftString && !is(leftType, TYPING_IDS.NUMBER)) || (!isRightString && !is(rightType, TYPING_IDS.NUMBER))) return compiler.errors.create(ast, ERROR_TYPES.TYPE, "Cannot add values different than strings or numbers");
            return isLeftString || isRightString ? TYPING_IDS.STRING:TYPING_IDS.NUMBER;
        }
        case "-":
        case "*":
        case "/":
        case "%": {
            if (!is(resolveType(ast.left, compiler), TYPING_IDS.NUMBER) || !is(resolveType(ast.right, compiler), TYPING_IDS.NUMBER)) return compiler.errors.create(ast, ERROR_TYPES.TYPE, "You can only use this operator on numbers");
            return TYPING_IDS.NUMBER;
        }
        case ">":
        case "<":
        case ">=":
        case "<=": 
            if (!is(resolveType(ast.left, compiler), TYPING_IDS.NUMBER) || !is(resolveType(ast.right, compiler), TYPING_IDS.NUMBER)) return compiler.errors.create(ast, ERROR_TYPES.TYPE, "You can only use this operator on numbers");
            return TYPING_IDS.BOOLEAN;
        case "&&":
            return resolveType(ast.right, compiler);
        case "||":
            return TYPING_IDS.BOOLEAN;
        default:
            return TYPING_IDS.UNKNOWN;
        }
    }
    case AST_TYPES.ASSIGN: {
        const ast = node as AST_Binary;
        switch(ast.left.type) {
        case AST_TYPES.ID: {
            const typeofLeft = resolve(resolveType(ast.left, compiler));
            if (!typeofLeft) return;
            if (typeofLeft.readonly) return compiler.errors.create(ast.left, ERROR_TYPES.TYPE, "Assignment to constant variable");
            const typeofRight = resolveType(ast.right, compiler);
            if (!is(typeofLeft, TYPING_IDS.NULL) && !compatible(typeofLeft, typeofRight)) return compiler.errors.create(ast, ERROR_TYPES.TYPE, "Incompatible types");
            if (!typeofLeft.nullable && is(typeofRight, TYPING_IDS.NULL)) return compiler.errors.create(ast, ERROR_TYPES.TYPE, "Incompatible types");
            if (is(typeofLeft, TYPING_IDS.NULL) && !is(typeofRight, TYPING_IDS.NULL)) {
                compiler.ctx.variableTypings[(ast.left as AST_Id).value] = {extends: typeofRight, nullable: true};
            }
            return typeofRight;
        }
        default:
            return;
        }
    }
    case AST_TYPES.DEFINE: {
        const el = node as AST_Define;
        const type: TypingResolvable = {extends: TYPING_IDS.NULL};
        if (el.defineType === "const") type.readonly = true;
        else if (el.defineType === "let" && !el.initializor) type.nullable = true;
        if (el.initializor) type.extends = resolveType(el.initializor, compiler);
        return type;
    }
    }
}