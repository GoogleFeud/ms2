import { Interpreter, OP_CODES } from "..";
import { PropertyAlias } from "../../util/default_property_alias";

export interface FunctionOptimizerContext {
    stringOutput?: boolean,
    argCounter?: number,
    inFunc?: boolean,
    offset: number,
    end: number   
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function FunctionOptimizer(interp: Interpreter, ctx: FunctionOptimizerContext = {offset: interp.pausedAt, end: interp.code.byteLength}) : Function|Array<string> {
    const code = interp.code;
    const stringStack: Array<string> = [];
    let offset = ctx.offset;
    const end = ctx.end;
    let argCounter = ctx.argCounter || 0;
    for (; offset < end;) {
        switch(code[offset++]) {
        case OP_CODES.PUSH_8:
            stringStack.push(code.readInt8(offset++).toString());
            break;
        case OP_CODES.PUSH_16:
            stringStack.push(code.readInt16BE(offset).toString());
            offset += 2;
            break;
        case OP_CODES.PUSH_32:
            stringStack.push(code.readFloatBE(offset).toString());
            offset += 4;
            break;
        case OP_CODES.PUSH_BOOL:
            stringStack.push(code.readUInt8(offset++).toString());
            break;
        case OP_CODES.PUSH_UNDEFINED:
            stringStack.push("undefined");
            break;
        case OP_CODES.PUSH_STR: {
            const size = code.readUInt16BE(offset);
            stringStack.push(code.toString("utf-8", offset += 2, offset += size));
            break;
        }
        case OP_CODES.PUSH_ARR: {
            const stackLen = stringStack.length;
            stringStack.push(JSON.stringify(stringStack.splice(stackLen - code.readInt16BE(offset), stackLen)));
            offset += 2;
            break;
        }
        case OP_CODES.PUSH_VAR: 
            stringStack.push(`this.memory[${code.readUInt16BE(offset)}]`);
            offset += 2;
            break;
        case OP_CODES.PUSH_ARG: 
            if (ctx.inFunc) stringStack.push(`arguments[${argCounter - (ctx.argCounter ?? 0)}]`); 
            else stringStack.push(`_${code.readUInt8(offset++)}`);
            argCounter++;
            break;
        case OP_CODES.LET:
            stringStack.push(`this.memory[this.currentMemoryAddress++] = ${stringStack[stringStack.length - 1]}`);
            break;
        case OP_CODES.LET_POP:
            stringStack.push(`this.memory[this.currentMemoryAddress++] = ${stringStack.pop()}`);
            break;
        case OP_CODES.ADD: {
            const first = stringStack.pop();
            const second = stringStack.pop();
            stringStack.push(`${second} + ${first}`);
            break;
        }
        case OP_CODES.ACCESS_STR: {
            const size = code.readUInt16BE(offset);
            stringStack.push(`${stringStack.pop()}.${code.toString("utf-8", offset += 2, offset += size)}`);
            break;
        }
        case OP_CODES.ACCESS:
            stringStack.push(`${stringStack.pop()}[${code.readUInt16BE(offset)}]`);
            offset += 2;
            break;
        case OP_CODES.ACCESS_OPTIONAL:
            stringStack.push(`${stringStack.pop()}?.[${code.readUInt16BE(offset)}]`);
            offset += 2;
            break;
        case OP_CODES.ACCESS_ALIAS:
            stringStack.push(`${stringStack.pop()}.${PropertyAlias[offset++]}`);
            break;
        case OP_CODES.ACCESS_ALIAS_OPTIONAL:
            stringStack.push(`${stringStack.pop()}?.${PropertyAlias[offset++]}`);
            break;
        case OP_CODES.CALL_POP:
        case OP_CODES.CALL: {
            const stackLen = stringStack.length;
            const args = stringStack.splice(stackLen - code.readUInt8(offset++), stackLen);
            stringStack.push(`${stringStack.pop()}(${args.join(",")})`);
            break;
        }
        case OP_CODES.RETURN: 
            stringStack.push(`return ${stringStack.pop()}`);
            break;
        default:
            throw new Error(`Unexpected byte ${code[offset]}`);
        }
    }
    if (ctx.stringOutput) return stringStack;
    return new Function(...Array.from({length: argCounter}, (el, index) => `_${index}`), stringStack.join(";")).bind(ctx);
}