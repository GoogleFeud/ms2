
import { Interpreter, OP_CODES } from "../../src/Interpreter";
import { expect } from "chai";
import { MSFunction } from "../../src/Interpreter/structs/MSFunction";

const Evaler = new Interpreter();

describe("FUNCTION", () => {

    it("Simple Function", () => {
        Evaler.clear().interpret(Buffer.from([
            OP_CODES.FN_START, 0x0, 0x2,
            OP_CODES.PUSH_8, 0x5,
            OP_CODES.FN_END,
            OP_CODES.END
        ]));
        const fn = Evaler.stack.pop();
        fn.call();
        expect(Evaler.stack.pop()).is.equal(5);
    });

    it("Variables", () => {
        Evaler.clear().interpret(Buffer.from([
            OP_CODES.LET,
            OP_CODES.FN_START, 0x0, 0x5,
            OP_CODES.PUSH_8, 0x5,
            OP_CODES.ASSIGN, 0x0, 0x0,
            OP_CODES.FN_END,
            OP_CODES.END
        ]));
        const fn = Evaler.stack.pop();
        fn.call();
        expect(Evaler.global.get(0)).to.be.equal(5);
    });

    describe("INNER_FUNCTIONS", () => {

        it("Function which returns a function", () => {
            Evaler.clear().interpret(Buffer.from([
                OP_CODES.FN_START, 0x0, 0xF,
    
                OP_CODES.FN_START_INNER, 0x0, 0x0, 0x8,
    
                OP_CODES.PUSH_VAR, 0x0, 0x0,
                OP_CODES.PUSH_VAR, 0x0, 0x1,
                OP_CODES.ADD,
                OP_CODES.RETURN,
    
                OP_CODES.FN_END_INNER, 0x0,
    
                OP_CODES.RETURN,
    
                OP_CODES.FN_END,
    
                OP_CODES.END
            ]));
            const fn = Evaler.stack.pop();
            expect(fn.call().call(undefined, 5, 5)).to.be.equal(10);
        });
    
        
        it("Function which creates a function and calls it", () => {
            Evaler.clear().interpret(Buffer.from([
                OP_CODES.FN_START, 0x0, 0x15,
    
                OP_CODES.FN_START_INNER, 0x0, 0x0, 0x8,
    
                OP_CODES.PUSH_VAR, 0x0, 0x0,
                OP_CODES.PUSH_VAR, 0x0, 0x1,
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
            const fn = Evaler.stack.pop();
            expect(fn.call()).to.be.equal(10);
        });
    
        it("Function which calls a function that accepts a function", () => {
            Evaler.clear();
            Evaler.global.define((fn: MSFunction) => {
                expect(fn.call(undefined, 10, 25)).to.be.equal(10);
            });
            Evaler.interpret(Buffer.from([
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
        });
    
        it("Function returns a function which returns a function", () => {
            Evaler.clear().interpret(Buffer.from([
                OP_CODES.FN_START, 0x0, 0x16,
    
                OP_CODES.FN_START_INNER, 0x0, 0x0, 0xF,
    
                OP_CODES.FN_START_INNER, 0x1, 0x0, 0x8,
    
                OP_CODES.PUSH_VAR, 0x0, 0x0,
                OP_CODES.PUSH_VAR, 0x0, 0x1,
                OP_CODES.ADD, 
                OP_CODES.RETURN,
    
                OP_CODES.FN_END_INNER, 0x1,
    
                OP_CODES.RETURN,
    
                OP_CODES.FN_END_INNER, 0x0,
    
                OP_CODES.RETURN,
                OP_CODES.FN_END,
    
                OP_CODES.END
            ]));
            const fn = Evaler.stack.pop();
            expect(fn.call().call(undefined, 1).call(undefined, 5)).to.be.equal(6);
        });
    });

});
