import { Interpreter, OP_CODES } from "..";


export class MSFunction {
    offset: number
    ctx: Interpreter
    constructor(offset: number, ctx: Interpreter) {
        this.offset = offset;
        this.ctx = ctx;
    }

    call<T>(thisArg: any, ...args: Array<any>) : T {
        this.ctx.interpret(this.ctx.code as Buffer, this.ctx.global, this.offset, OP_CODES.FN_END, args);
        const rtrnValue = this.ctx.returnValue;
        delete this.ctx.returnValue;
        return rtrnValue;
    }
} 