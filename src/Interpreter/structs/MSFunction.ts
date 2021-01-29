import { Interpreter, OP_CODES } from "..";

export class MSFunction {
    offset: number
    id?: number
    ctx: Interpreter
    constructor(offset: number, ctx: Interpreter, id?: number) {
        this.offset = offset;
        this.ctx = ctx;
        this.id = id;
    }

    call<T>(thisArg: any, ...args: Array<any>) : T {
        this.ctx.global.defineLot(args);
        this.ctx.interpret(this.ctx.code as Buffer, this.ctx.global, this.offset, this.id === undefined ? OP_CODES.FN_END:OP_CODES.FN_END_INNER, this.id);
        const rtrnValue = this.ctx.returnValue;
        delete this.ctx.returnValue;
        return rtrnValue;
    }
} 