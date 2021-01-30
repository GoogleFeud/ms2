import { Interpreter, OP_CODES } from "..";

export class MSFunction {
    offset: number
    id?: number
    ctx: Interpreter
    private readonly endByteType: OP_CODES
    constructor(offset: number, ctx: Interpreter, id?: number) {
        this.offset = offset;
        this.ctx = ctx;
        this.id = id;
        this.endByteType = id === undefined ? OP_CODES.FN_END:OP_CODES.FN_END_INNER;
    }

    call<T>(thisArg: any, ...args: Array<any>) : T {
        this.ctx.global.defineLot(args);
        this.ctx.interpret(this.ctx.code as Buffer, this.ctx.global, this.offset, this.endByteType, this.id);
        const rtrnValue = this.ctx.returnValue;
        delete this.ctx.returnValue;
        return rtrnValue;
    }
    
} 