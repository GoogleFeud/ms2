import { Interpreter } from "..";

export class MSFunction extends Function {

    //@ts-expect-error It shouldn't really be an error
    constructor(offset: number, size: number, inFunc: boolean|undefined, ctx: Interpreter) {
        // eslint-disable-next-line no-constant-condition
        const endsAt = offset + size;
        const shouldClearArgs = !inFunc;
        const fn = (...args: Array<any>) => {
            if (shouldClearArgs) ctx.arguments.length = 0;
            ctx.arguments.push(...args);
            return ctx.interpret(offset, endsAt, true); 
        };
        Object.setPrototypeOf(fn, MSFunction.prototype);
        return fn;
    }
    
} 