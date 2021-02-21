
import { Interpreter, OP_CODES } from "../../src/Interpreter";
import { FunctionOptimizer } from "../../src/Interpreter/Optimizer";
import { expect } from "chai";

describe("Optimizer", () => {

    describe("Arithmetic", () => {

        it("Arg + 5", () => {
            const Evaler = new Interpreter(Buffer.from([
                0x0, 0x0,
                OP_CODES.PUSH_ARG, 0x0,
                OP_CODES.PUSH_8, 0x5,
                OP_CODES.ADD,
                OP_CODES.RETURN
            ]));
            
            const fn = FunctionOptimizer(Evaler) as (num: number) => number;
            
            expect(fn(5)).to.be.equal(10);
        });

    });

});


