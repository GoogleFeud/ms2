
import { Interpreter, OP_CODES } from "../../src/Interpreter";
import { expect } from "chai";


const Evaler = new Interpreter();

describe("LOOP", () => {

    it("for (let i=0; i < 10; i++)", () => {
        Evaler.clear();
        Evaler.interpret(Buffer.from([
            OP_CODES.ALLOC, 0x0, 0x2,
            OP_CODES.PUSH_ARR, 0x0, 0x0, OP_CODES.ASSIGN_INC_POP, // let arr = [];
            OP_CODES.PUSH_8, 0x0, OP_CODES.ASSIGN_INC, // let i = 0;
            OP_CODES.PUSH_8, 0xA, // 10
            OP_CODES.LESS_THAN, // i < 10
            OP_CODES.JUMP_FALSE, 0x0, 0x10,
            OP_CODES.PUSH_VAR, 0x0, 0x0,
            OP_CODES.ACCESS_ALIAS, 0x1,
            OP_CODES.PUSH_VAR, 0x0, 0x1,
            OP_CODES.CALL_POP, 0x1,
            OP_CODES.INC, 0x0, 0x1,
            OP_CODES.GOTO, 0x0, 0xA,
            OP_CODES.END
        ]));

        /** Same as:
         * const arr = [];
         * for (let i=0; i < 10; i++) {
         *   arr.push(i);
         * }
         */
        expect(Evaler.global.get(0)).members([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it("Defining variables in loops", () => {
        // Actual variable declaration happens outside of the loop
        Evaler.clear().interpret(Buffer.from([
            OP_CODES.ALLOC, 0x0, 0x2,
            OP_CODES.PUSH_8, 0x0, OP_CODES.ASSIGN_INC, // let i = 0;
            OP_CODES.PUSH_8, 0xA, // 10
            OP_CODES.LESS_THAN, // i < 10
            OP_CODES.JUMP_FALSE, 0x0, 0xF,
            OP_CODES.PUSH_VAR, 0x0, 0x0, OP_CODES.ASSIGN_POP, 0x0, 0x1, // let newI = i;
            OP_CODES.DEC_POP, 0x0, 0x1, // decrement newI
            OP_CODES.INC, 0x0, 0x0, // increment i
            OP_CODES.GOTO, 0x0, 0x6,
            OP_CODES.END
        ]));
        expect(Evaler.global.get(1)).to.be.equal(8);
    });
});