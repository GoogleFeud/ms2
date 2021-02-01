
import { MSFunction } from "./structs/MSFunction";
import { PropertyAlias } from "../util/default_property_alias";

export const enum OP_CODES {
    PUSH_32,
    PUSH_16,
    PUSH_8,
    PUSH_BOOL,
    PUSH_UNDEFINED,
    PUSH_STR,
    PUSH_ARR,
    PUSH_VAR,
    PUSH_ARG,
    ADD,
    DIV,
    MUL,
    SUB,
    INC,
    INC_POP,
    DEC,
    DEC_POP,
    ACCESS,
    ACCESS_STR,
    ACCESS_ALIAS,
    LET,
    LET_POP,
    ASSIGN,
    ASSIGN_POP,
    ASSIGN_PROP,
    ASSIGN_PROP_POP,
    ASSIGN_PROP_ALIAS,
    ASSIGN_PROP_ALIAS_POP,
    FN_START,
    FN_START_INNER,
    FN_END,
    FN_END_INNER,
    JUMP_TRUE,
    JUMP_FALSE,
    JUMP,
    GOTO,
    RETURN,
    ELSE,
    CALL,
    CALL_POP,
    EXPORT,
    EXPORT_ALIAS,
    OR,
    AND,
    EQUAL,
    NOT,
    GREATER_THAN,
    LESS_THAN,
    GREATER_OR_EQUAL,
    LESS_OR_EQUAL,
    BREAKPOINT,
    END
}

export class Interpreter {
    stack: Array<any>
    exports: Record<string, any>
    memory: Array<any>
    arguments: Array<any>
    code: Buffer
    returnValue: any
    private pausedAt: number
    currentMemoryAddress: number
    onBreakpoint?: () => boolean; 
    constructor(code: Buffer) {
        this.code = code;
        this.stack = [];
        this.exports = {};
        this.memory = new Array(code.readUInt16BE(0));
        this.arguments = [];
        this.pausedAt = 2;
        this.currentMemoryAddress = 0;
    }

    reuse(code: Buffer) : this {
        this.stack.length = 0;
        this.code = code;
        this.exports = {};
        this.memory = new Array(code.readUInt16BE(0));
        this.pausedAt = 2;
        return this;
    }

    addGlobal(thing: any, index = this.currentMemoryAddress) : this {
        this.memory[index] = thing;
        this.currentMemoryAddress++;
        return this;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    /**
     * 
     * @param offset - Where to start interpreting the code
     * @param endByte - Where to stop interpreting the code
     * @param endByteArg - An extra byte 
     */
    interpret(offset = this.pausedAt, endByte = OP_CODES.END, endByteArg?: number) : number {
        const code = this.code;
        const memory = this.memory;
        const stack = this.stack;
        for(;;) {
            switch(code[offset++]) {
            case OP_CODES.PUSH_32:
                stack.push(code.readFloatBE(offset));
                offset += 4;
                break;
            case OP_CODES.PUSH_16:
                stack.push(code.readInt16BE(offset));
                offset += 2;
                break;
            case OP_CODES.PUSH_8:
                stack.push(code.readInt8(offset++));
                break;
            case OP_CODES.PUSH_BOOL:
                stack.push(Boolean(code.readInt8(offset++)));
                break;
            case OP_CODES.PUSH_UNDEFINED:
                stack.push(undefined);
                break;
            case OP_CODES.PUSH_STR: {
                const size = code.readUInt16BE(offset);
                stack.push(code.toString("utf-8", offset += 2, offset += size));
                break;
            }
            case OP_CODES.PUSH_ARR: {
                const stackLen = stack.length;
                stack.push(stack.splice(stackLen - code.readInt16BE(offset), stackLen));
                offset += 2;
                break;
            }
            case OP_CODES.PUSH_VAR: 
                stack.push(memory[code.readUInt16BE(offset)]);
                offset += 2;
                break;
            case OP_CODES.PUSH_ARG:
                stack.push(this.arguments[code.readUInt8(offset++)]);
                break;
            case OP_CODES.ADD: {
                const first = stack.pop();
                const second = stack.pop();
                stack.push(second + first);
                break;
            }
            case OP_CODES.SUB: {
                const first = stack.pop();
                const second = stack.pop();
                stack.push(second - first);
                break;
            }
            case OP_CODES.DIV: {
                const first = stack.pop();
                const second = stack.pop();
                stack.push(second / first);
                break;
            }
            case OP_CODES.MUL:
                stack.push(stack.pop() * stack.pop());
                break;
            case OP_CODES.INC:
                stack.push(++memory[code.readUInt16BE(offset)]);
                offset += 2;
                break;
            case OP_CODES.DEC:
                stack.push(--memory[code.readUInt16BE(offset)]);
                offset += 2;
                break;
            case OP_CODES.INC_POP:
                ++memory[code.readUInt16BE(offset)];
                offset += 2;
                break;
            case OP_CODES.DEC_POP:
                --memory[code.readUInt16BE(offset)];
                offset += 2;
                break;
            case OP_CODES.EQUAL: 
                stack.push(stack.pop() === stack.pop());
                break;
            case OP_CODES.LESS_THAN: {
                const first = stack.pop();
                const second = stack.pop();
                stack.push(second < first);
                break;
            }
            case OP_CODES.LESS_OR_EQUAL: {
                const first = stack.pop();
                const second = stack.pop();
                stack.push(second <= first);
                break;
            }
            case OP_CODES.GREATER_THAN: {
                const first = stack.pop();
                const second = stack.pop();
                stack.push(second > first);
                break;
            }
            case OP_CODES.GREATER_OR_EQUAL: {
                const first = stack.pop();
                const second = stack.pop();
                stack.push(second >= first);
                break;
            }
            case OP_CODES.AND: {
                const first = stack.pop();
                const second = stack.pop();
                stack.push(second && first);
                break;
            }
            case OP_CODES.OR: {
                const first = stack.pop();
                const second = stack.pop();
                stack.push(second || first);
                break;
            }
            case OP_CODES.NOT:
                stack.push(!stack.pop());
                break;
            case OP_CODES.ACCESS: {
                const item = stack.pop();
                stack.push(item[code.readUInt16BE(offset)]);
                offset += 2;
                break;
            }
            case OP_CODES.ACCESS_STR: {
                const item = stack.pop();
                const size = code.readUInt16BE(offset);
                let res = item[code.toString("utf-8", offset += 2, offset += size)];
                if (typeof res === "function") res = res.bind(item);
                stack.push(res);
                break;
            }
            case OP_CODES.ACCESS_ALIAS: {
                const item = stack.pop();
                let res = item[PropertyAlias[code.readUInt8(offset++) as 0]];
                if (typeof res === "function") res = res.bind(item);
                stack.push(res);
                break;
            }
            case OP_CODES.LET:
                memory[this.currentMemoryAddress++] = stack[stack.length - 1];
                break;
            case OP_CODES.LET_POP:
                memory[this.currentMemoryAddress++] = stack.pop();
                break;
            case OP_CODES.ASSIGN:
                memory[code.readUInt16BE(offset)] = stack[stack.length - 1];
                offset += 2;
                break;
            case OP_CODES.ASSIGN_POP:
                memory[code.readUInt16BE(offset)] = stack.pop();
                offset += 2;
                break;
            case OP_CODES.ASSIGN_PROP: {
                const value = stack.pop();
                const propToModify = stack.pop();
                const propParent = stack.pop();
                stack.push(propParent[propToModify] = value);
                break;
            }
            case OP_CODES.ASSIGN_PROP_POP: {
                const value = stack.pop();
                const propToModify = stack.pop();
                const propParent = stack.pop();
                propParent[propToModify] = value;
                break;
            }
            case OP_CODES.ASSIGN_PROP_ALIAS: {
                const value = stack.pop();
                const propToModify = PropertyAlias[stack.pop()];
                const propParent = stack.pop();
                stack.push(propParent[propToModify] = value);
                break;
            }
            case OP_CODES.ASSIGN_PROP_ALIAS_POP: {
                const value = stack.pop();
                const propToModify = PropertyAlias[stack.pop()];
                const propParent = stack.pop();
                propParent[propToModify] = value;
                break;
            }
            case OP_CODES.FN_START: {
                const size = code.readUInt16BE(offset);
                offset += 2;
                stack.push(new MSFunction(offset, this));
                offset += size + 1; // Account for the FN_END code
                break;
            }
            case OP_CODES.FN_START_INNER: {
                const id = code.readUInt8(offset);
                const size = code.readUInt16BE(++offset);
                stack.push(new MSFunction(offset += 2, this, id));
                offset += size + 2; // Account for the FN_END_INNER code
                break;
            }
            case OP_CODES.RETURN:
                this.returnValue = stack.pop();
                break;
            case OP_CODES.CALL: {
                const stackLen = stack.length;
                const args = stack.splice(stackLen - code.readUInt8(offset++), stackLen);
                stack.push(this.returnValue = stack.pop().call(undefined, ...args)); 
                break;
            }
            case OP_CODES.CALL_POP: {
                const stackLen = stack.length;
                const args = stack.splice(stackLen - code.readUInt8(offset++), stackLen);
                this.returnValue = stack.pop().call(undefined, ...args); 
                break;
            }
            case OP_CODES.JUMP_FALSE:
                if (!stack.pop()) offset += code.readUInt16BE(offset);
                offset += 2;
                break;
            case OP_CODES.JUMP_TRUE:
                if (stack.pop()) offset += code.readUInt16BE(offset);
                offset += 2;
                break;
            case OP_CODES.JUMP:
                offset += code.readUInt16BE(offset) + 2;
                break;
            case OP_CODES.GOTO:
                offset = code.readUInt16BE(offset);
                break;
            case OP_CODES.EXPORT: {
                const size = code.readUInt16BE(offset);
                this.exports[code.toString("utf-8", offset += 2, offset += size)] = stack.pop();
                break;
            }
            case OP_CODES.EXPORT_ALIAS: {
                this.exports[PropertyAlias[code.readUInt8(offset++)]] = stack.pop();
                break;
            }
            case OP_CODES.BREAKPOINT: 
                this.pausedAt = offset;
                if (this.onBreakpoint && this.onBreakpoint()) return this.interpret(this.pausedAt, endByte);
                return offset;
            case endByte:
                if (endByteArg) return offset + 1;
                return offset;
            default:
                throw `Unknown OP code at byte ${offset}`;
            }
        }
    }


}