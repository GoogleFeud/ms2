import { Interpreter } from "..";

export class MSFunction {
    offset: number
    endsAt: number
    private readonly shouldClearArgsStack: boolean|undefined
    ctx: Interpreter
    constructor(offset: number, size: number, inFunc: boolean|undefined, ctx: Interpreter) {
        this.offset = offset;
        this.endsAt = this.offset + size;
        this.shouldClearArgsStack = !inFunc;
        this.ctx = ctx;
    }

    call<T>(thisArg: any, ...args: Array<any>) : T {
        if (this.shouldClearArgsStack) this.ctx.arguments.length = 0;
        this.ctx.arguments.push(...args);
        return this.ctx.interpret(this.offset, this.endsAt, true);
    }
    
} 