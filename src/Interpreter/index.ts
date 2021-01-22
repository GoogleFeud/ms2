
import { Enviourment } from "./Enviourment";

export const enum OP_CODES {
    PUSH_32,
    PUSH_16,
    PUSH_8,
    PUSH_BOOL,
    PUSH_STR,
    PUSH_ARR,
    PUSH_VAR,
    ADD,
    DIV,
    MUL,
    SUB,
    ACCESS,
    ACCESS_STR,
    LET,
    ASSIGN,
    FN_START,
    FN_END,
    IF_START,
    IF_END,
    RTRN,
    ELSE,
    CALL,
    EXPORT,
    OR,
    AND,
    EQUAL,
    NOT,
    GREATER_THAN,
    LESS_THAN,
    GREATER_OR_EQUAL,
    LESS_OR_EQUAL,
    END
}

export class Interpreter {
    stack: Array<any>
    global: Enviourment
    constructor() {
        this.stack = [];
        this.global = new Enviourment();
    }

    clear() {
        this.global.entries = {};
        this.stack.length = 0;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interpret(code: Buffer, env = this.global, offset = 0, endByte = OP_CODES.END) : number {
        let address = offset;
        for(;;) {
            switch(code[address++]) {
            case OP_CODES.PUSH_32:
                this.stack.push(code.readFloatBE(address));
                address += 4;
                break;
            case OP_CODES.PUSH_16:
                this.stack.push(code.readInt16BE(address));
                address += 2;
                break;
            case OP_CODES.PUSH_8:
                this.stack.push(code.readInt8(address));
                address++;
                break;
            case OP_CODES.PUSH_BOOL:
                this.stack.push(Boolean(code.readInt8(address)));
                address++;
                break;
            case OP_CODES.PUSH_STR: {
                const size = code.readInt16BE(address);
                address += 2;
                this.stack.push(code.toString("utf-8", address, address + size));
                address += size;
                break;
            }
            case OP_CODES.PUSH_ARR: {
                const size = code.readInt16BE(address);
                address += 2;
                const arr = [];
                for (let i=0; i < size; i++) {
                    arr.push(this.stack.pop());
                }
                arr.reverse();
                this.stack.push(arr);
                break;
            }
            case OP_CODES.PUSH_VAR: 
                this.stack.push(env.get(code.readInt16BE(address)));
                address += 2;
                break;
            case OP_CODES.ADD: {
                const first = this.stack.pop();
                const second = this.stack.pop();
                this.stack.push(second + first);
                break;
            }
            case OP_CODES.SUB: {
                const first = this.stack.pop();
                const second = this.stack.pop();
                this.stack.push(second - first);
                break;
            }
            case OP_CODES.DIV: {
                const first = this.stack.pop();
                const second = this.stack.pop();
                this.stack.push(second / first);
                break;
            }
            case OP_CODES.MUL: {
                const first = this.stack.pop();
                const second = this.stack.pop();
                this.stack.push(second / first);
                break;
            }
            case OP_CODES.ACCESS: {
                const item = this.stack.pop();
                this.stack.push(item[code.readInt16BE(address)]);
                address += 2;
                break;
            }
            case OP_CODES.ACCESS_STR: {
                const item = this.stack.pop();
                const size = code.readInt16BE(address);
                address += 2;
                this.stack.push(item[code.toString("utf-8", address, address + size)]);
                address += size;
                break;
            }
            case OP_CODES.LET: 
                env.define(code.readInt16BE(address), this.stack.pop());
                address += 2;
                break;
            case OP_CODES.ASSIGN:
                env.set(code.readInt16BE(address), this.stack.pop());
                address += 2;
                break;
            case OP_CODES.IF_START: {
                const bool = Boolean(this.stack.pop());
                if (bool) address = this.interpret(code, env, address, OP_CODES.IF_END);
                else address = this.skipTo(code, address, OP_CODES.IF_END);
                this.stack.push(bool);
                break;
            }
            case endByte: {
                return address;
            }
            default:
                throw `Unknown OP code at byte ${address}`;
            }
        }
    }

    skipTo(code: Buffer, offset: number, endByte: OP_CODES) : number {
        for(;;) {
            switch(code[offset++]) {
            case OP_CODES.PUSH_32:
                offset += 4;
                break;
            case OP_CODES.PUSH_16:
            case OP_CODES.LET:
            case OP_CODES.ASSIGN:
            case OP_CODES.PUSH_ARR:
            case OP_CODES.PUSH_VAR:
                offset += 2;
                break;
            case OP_CODES.PUSH_8:
            case OP_CODES.PUSH_BOOL:
                offset++;
                break;
            case OP_CODES.PUSH_STR:
                offset += code.readInt16BE(offset) + 2;
                break;
            case OP_CODES.IF_START:
                offset += this.skipTo(code, offset, OP_CODES.IF_END);
                break;
            case endByte:
                return offset;
            }
        }
    }

}