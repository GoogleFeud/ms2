
import { Interpreter, OP_CODES } from "../../src/Interpreter";
import { expect } from "chai";
import { MSFunction } from "../../src/Interpreter/structs/MSFunction";

describe("FUNCTION", () => {

    it("Simple Function", () => {
        const Evaler = new Interpreter(Buffer.from([
            0x0, 0x0,
            OP_CODES.FN_START, 0x0, 0x2,
            OP_CODES.PUSH_8, 0x5,
            OP_CODES.FN_END,
            OP_CODES.END
        ]));
        Evaler.interpret();
        const fn = Evaler.stack.pop();
        fn.call();
        expect(Evaler.stack.pop()).is.equal(5);
    });

    it("Variables", () => {
        const Evaler = new Interpreter(Buffer.from([
            0x0, 0x0,
            OP_CODES.LET,
            OP_CODES.FN_START, 0x0, 0x5,
            OP_CODES.PUSH_8, 0x5,
            OP_CODES.ASSIGN, 0x0, 0x0,
            OP_CODES.FN_END,
            OP_CODES.END
        ]));
        Evaler.interpret();
        const fn = Evaler.stack.pop();
        fn.call();
        expect(Evaler.memory[0]).to.be.equal(5);
    });

    describe("INNER_FUNCTIONS", () => {

        it("Function which returns a function", () => {
            const Evaler = new Interpreter(Buffer.from([
                0x0, 0x2,
                OP_CODES.FN_START, 0x0, 0xD,
    
                OP_CODES.FN_START_INNER, 0x0, 0x0, 0x6,
    
                OP_CODES.PUSH_ARG, 0x0,
                OP_CODES.PUSH_ARG, 0x1,
                OP_CODES.ADD,
                OP_CODES.RETURN,
    
                OP_CODES.FN_END_INNER, 0x0,
    
                OP_CODES.RETURN,
    
                OP_CODES.FN_END,
    
                OP_CODES.END
            ]));
            Evaler.interpret();
            const fn = Evaler.stack.pop();
            expect(fn.call().call(undefined, 5, 5)).to.be.equal(10);
        });
    
        
        it("Function which creates a function and calls it", () => {
            const Evaler = new Interpreter(Buffer.from([
                0x0, 0x2,
                OP_CODES.FN_START, 0x0, 0x13,
    
                OP_CODES.FN_START_INNER, 0x0, 0x0, 0x6,
    
                OP_CODES.PUSH_ARG, 0x0,
                OP_CODES.PUSH_ARG, 0x1,
                OP_CODES.ADD,
                OP_CODES.RETURN,
    
                OP_CODES.FN_END_INNER, 0x0,
    
                OP_CODES.PUSH_8, 0x5,
                OP_CODES.PUSH_8, 0x5,
                OP_CODES.CALL, 0x2,
                OP_CODES.RETURN,
    
                OP_CODES.FN_END,
    
                OP_CODES.END
            ]));
            Evaler.interpret();
            const fn = Evaler.stack.pop();
            expect(fn.call()).to.be.equal(10);
        });
    
        it("Function which calls a function that accepts a function", () => {
            const Evaler = new Interpreter(Buffer.from([
                0x0, 0x3,
                OP_CODES.FN_START, 0x0, 0x13,
    
                OP_CODES.PUSH_VAR, 0x0, 0x0,
                OP_CODES.FN_START_INNER, 0x0, 0x0, 0x8,
    
                OP_CODES.PUSH_VAR, 0x0, 0x1,
                OP_CODES.PUSH_VAR, 0x0, 0x2,
                OP_CODES.ADD,
                OP_CODES.RETURN,
    
                OP_CODES.FN_END_INNER, 0x0,
    
                OP_CODES.CALL, 0x1,
    
                OP_CODES.FN_END,
    
                OP_CODES.END
            ]));
            Evaler.addGlobal((fn: MSFunction) => {
                expect(fn.call(undefined, 10, 25)).to.be.equal(10);
            });
            Evaler.interpret();
        });
    
        it("Function returns a function which returns a function", () => {
            const Evaler = new Interpreter(Buffer.from([
                0x0, 0x0,
                OP_CODES.FN_START, 0x0, 0x14,
    
                OP_CODES.FN_START_INNER, 0x0, 0x0, 0xD,
    
                OP_CODES.FN_START_INNER, 0x1, 0x0, 0x6,
    
                OP_CODES.PUSH_ARG, 0x0,
                OP_CODES.PUSH_ARG, 0x1,
                OP_CODES.ADD, 
                OP_CODES.RETURN,
    
                OP_CODES.FN_END_INNER, 0x1,
    
                OP_CODES.RETURN,
    
                OP_CODES.FN_END_INNER, 0x0,
    
                OP_CODES.RETURN,
                OP_CODES.FN_END,
    
                OP_CODES.END
            ]));
            Evaler.interpret();
            const fn = Evaler.stack.pop();
            expect(fn.call().call(undefined, 1).call(undefined, 5)).to.be.equal(6);
        });
    });

});
