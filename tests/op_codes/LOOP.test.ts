
import { Interpreter, OP_CODES } from "../../src/Interpreter";
import { expect } from "chai";


describe("LOOP", () => {

    it("for (let i=0; i < 10; i++)", () => {
        const Evaler = new Interpreter(Buffer.from([
            0x0, 0x2,
            OP_CODES.PUSH_ARR, 0x0, 0x0, OP_CODES.LET, // let arr = [];
            OP_CODES.PUSH_8, 0x0, OP_CODES.LET, // let i = 0;
            OP_CODES.PUSH_8, 0xA, // 10
            OP_CODES.LESS_THAN, // i < 10
            OP_CODES.JUMP_FALSE, 0x0, 0x10,
            OP_CODES.PUSH_VAR, 0x0, 0x0,
            OP_CODES.ACCESS_ALIAS, 0x1,
            OP_CODES.PUSH_VAR, 0x0, 0x1,
            OP_CODES.CALL_POP, 0x1,
            OP_CODES.INC, 0x0, 0x1,
            OP_CODES.GOTO, 0x0, 0x9,
        ]));

        /** Same as:
         * const arr = [];
         * for (let i=0; i < 10; i++) {
         *   arr.push(i);
         * }
         */
        Evaler.interpret();
        expect(Evaler.memory[0]).members([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it("Defining variables in loops", () => {
        const Evaler = new Interpreter(Buffer.from([
            0x0, 0x2,
            OP_CODES.PUSH_8, 0x0, OP_CODES.LET, // let i = 0;
            OP_CODES.PUSH_8, 0xA, // 10
            OP_CODES.LESS_THAN, // i < 10
            OP_CODES.JUMP_FALSE, 0x0, 0xF,
            OP_CODES.PUSH_VAR, 0x0, 0x0, OP_CODES.ASSIGN_POP, 0x0, 0x1, // let newI = i;
            OP_CODES.DEC_POP, 0x0, 0x1, // decrement newI
            OP_CODES.INC, 0x0, 0x0, // increment i
            OP_CODES.GOTO, 0x0, 0x5
        ]));
        Evaler.interpret();
        expect(Evaler.memory[1]).to.be.equal(8);
    });

    it("Break keyword", () => {
        const Evaler = new Interpreter(Buffer.from([
            0x0, 0x2,
            OP_CODES.PUSH_ARR, 0x0, 0x0, OP_CODES.LET, // let arr = [];
            OP_CODES.PUSH_8, 0x0, OP_CODES.LET, // let i = 0;
            OP_CODES.PUSH_8, 0xA, // 10
            OP_CODES.LESS_THAN, // i < 10
            OP_CODES.JUMP_FALSE, 0x0, 0x1A,
            OP_CODES.PUSH_VAR, 0x0, 0x1,
            OP_CODES.PUSH_8, 0x5,
            OP_CODES.EQUAL,
            OP_CODES.JUMP_FALSE, 0x0, 0x1,
            OP_CODES.BREAK,
            OP_CODES.PUSH_VAR, 0x0, 0x0,
            OP_CODES.ACCESS_ALIAS, 0x1,
            OP_CODES.PUSH_VAR, 0x0, 0x1,
            OP_CODES.CALL_POP, 0x1,
            OP_CODES.INC, 0x0, 0x1,
            OP_CODES.GOTO, 0x0, 0x9
        ]));
        Evaler.interpret();
        expect(Evaler.memory[0]).members([0, 1, 2, 3, 4]);
    });
});