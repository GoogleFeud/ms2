
import { Interpreter, OP_CODES } from "../../src/Interpreter";
import { expect } from "chai";


describe("CALL", () => {

    it("Simple Call", () => {
        const Evaler = new Interpreter(Buffer.from([
            0x0, 0x1,
            OP_CODES.FN, 0x0, 0x6,
            OP_CODES.PUSH_8, 0x5,
            OP_CODES.ASSIGN, 0x0, 0x0,
            OP_CODES.RETURN,
            OP_CODES.CALL, 0x0,
        ]));
        Evaler.interpret();
        expect(Evaler.stack.pop()).is.equal(5);
    });

    it("Argument order", () => {
        const Evaler = new Interpreter(Buffer.from([
            0x0, 0x0,
            OP_CODES.FN, 0x0, 0x6,
            OP_CODES.PUSH_ARG, 0x0,
            OP_CODES.PUSH_ARG, 0x1,
            OP_CODES.SUB,
            OP_CODES.RETURN
        ]));
        Evaler.interpret();
        expect(Evaler.stack.pop().call(undefined, 7, 3)).to.be.equal(4);
    });

    
    it("Argument order 2", () => {
        const Evaler = new Interpreter(Buffer.from([
            0x0, 0x1,
            OP_CODES.PUSH_VAR, 0x0, 0x0,
            OP_CODES.PUSH_8, 0xA,
            OP_CODES.PUSH_8, 0x5,
            OP_CODES.CALL, 0x2
        ]));
        Evaler.addGlobal((a: number, b: number) => {
            return a - b;
        });
        Evaler.interpret();
        expect(Evaler.stack.pop()).to.be.equal(5);
    });

    it("Native function call", () => {
        const Evaler = new Interpreter(Buffer.from([
            0x0, 0x1,
            OP_CODES.PUSH_VAR, 0x0, 0x0,
            OP_CODES.PUSH_8, 0x2,
            OP_CODES.CALL, 0x1
        ]));
        let res;
        Evaler.addGlobal((a: any) => res = a);
        Evaler.interpret();
        expect(res).is.equal(2);
    });

    it("Array.push", () => {
        const Evaler = new Interpreter(Buffer.from([
            0x0, 0x1,
            OP_CODES.PUSH_8, 0x2,
            OP_CODES.PUSH_8, 0x5,
            OP_CODES.PUSH_8, 0x6,
            OP_CODES.PUSH_8, 0x8,
            OP_CODES.PUSH_ARR, 0x0, 0x4,
            OP_CODES.LET,
            OP_CODES.ACCESS_STR, 0x0, 0x4, 0x70, 0x75, 0x73, 0x68,
            OP_CODES.PUSH_8, 0x9,
            OP_CODES.CALL, 0x1
        ]));
        Evaler.interpret();
        expect(Evaler.memory[0]).members([2, 5, 6, 8, 9]);
    });

    it("Native-native function calling custom function", () => {
        const Evaler = new Interpreter(Buffer.from([
            0x0, 0x1,
            OP_CODES.FN, 0x0, 0x6,
            OP_CODES.PUSH_ARG, 0x0,
            OP_CODES.PUSH_ARG, 0x1,
            OP_CODES.SUB,
            OP_CODES.RETURN,
            OP_CODES.LET
        ]));
        Evaler.interpret();
        const sortfn = Evaler.memory[0];
        const arr = [5, 4, 3, 1, 2].sort((a, b) => sortfn.call(a, b));
        expect(arr).members([1, 2, 3, 4, 5]);
    });

    it("Return value", () => {
        const Evaler = new Interpreter(Buffer.from([
            0x0, 0x2,
            OP_CODES.FN, 0x0, 0x7,

            OP_CODES.INC, 0x0, 0x0,
            OP_CODES.RETURN,
            OP_CODES.INC, 0x0, 0x0,

            OP_CODES.LET
        ]));
        Evaler.addGlobal(1);
        Evaler.interpret();
        expect(Evaler.memory[1].call()).to.be.equal(2);
    });

    it("2 separate function calls", () => {
        const Evaler = new Interpreter(Buffer.from([
            0x0, 0x3,
            OP_CODES.FN, 0x0, 0x6,
            OP_CODES.PUSH_ARG, 0x0,
            OP_CODES.PUSH_ARG, 0x1,
            OP_CODES.ADD,
            OP_CODES.RETURN,
            OP_CODES.LET, // Offset 0

            OP_CODES.PUSH_8, 0x1,
            OP_CODES.PUSH_8, 0x2,
            OP_CODES.CALL, 0x2,
            OP_CODES.LET_POP, // Offset 1

            OP_CODES.PUSH_VAR, 0x0, 0x0,
            OP_CODES.PUSH_8, 0x9,
            OP_CODES.PUSH_8, 0x0,
            OP_CODES.CALL, 0x2,
            OP_CODES.LET_POP // Offset 2
        ]));
        Evaler.interpret();
        expect(Evaler.memory[1]).to.be.equal(3);
        expect(Evaler.memory[2]).to.be.equal(9);
    });

    it("2 functions, 2 function calls", () => {
        const Evaler = new Interpreter(Buffer.from([
            0x0, 0x3,
            OP_CODES.FN, 0x0, 0x6,
            OP_CODES.PUSH_ARG, 0x0,
            OP_CODES.PUSH_ARG, 0x1,
            OP_CODES.ADD,
            OP_CODES.RETURN,
            OP_CODES.LET, // Offset 0

            OP_CODES.FN, 0x0, 0x6,
            OP_CODES.PUSH_ARG, 0x0,
            OP_CODES.PUSH_ARG, 0x1,
            OP_CODES.SUB,
            OP_CODES.RETURN,
            OP_CODES.LET_POP, // Offset 1

            OP_CODES.PUSH_VAR, 0x0, 0x1, 
            OP_CODES.PUSH_VAR, 0x0, 0x0,
            OP_CODES.PUSH_8, 0x5,
            OP_CODES.PUSH_8, 0x5,
            OP_CODES.CALL, 0x2, // add(5, 5);
            OP_CODES.PUSH_8, 0x4,
            OP_CODES.CALL, 0x2, // sub(add(5, 5), 4);
            OP_CODES.LET_POP, // const res = sub(add(5, 5), 4);
        ]));
        Evaler.interpret();
        expect(Evaler.memory[2]).to.be.equal(6);
    });

});