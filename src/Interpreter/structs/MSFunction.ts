import { Interpreter } from "..";

export class MSFunction extends Function {
    onEnd?: () => void;
    //@ts-expect-error It shouldn't really be an error
    constructor(offset: number, size: number, totalArgs?: Array<any>, ctx: Interpreter) {
        // eslint-disable-next-line no-constant-condition
        const endsAt = offset + size;
        const fn = (...args: Array<any>) => {
            const copiedArgs = totalArgs ? totalArgs.concat(...args):[];
            const val = ctx.interpret(offset, endsAt, copiedArgs, args); 
            return val;
        };
        Object.setPrototypeOf(fn, MSFunction.prototype);
        return fn;
    }
    
} 