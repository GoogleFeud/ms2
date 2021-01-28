
import { Interpreter, OP_CODES } from "../../src/Interpreter";
import { expect } from "chai";


const Evaler = new Interpreter();

describe("LOOP", () => {

    it("for (let i=0; i < 10; i++)", () => {
        Evaler.clear();
        Evaler.interpret(Buffer.from([
            OP_CODES.PUSH_ARR, 0x0, 0x0, OP_CODES.LET_POP, // let arr = [];
            OP_CODES.PUSH_8, 0x0, OP_CODES.LET, // let i = 0;
            OP_CODES.PUSH_8, 0xA, // 10
            OP_CODES.LESS_THAN, // i < 10
            OP_CODES.JUMP_FALSE, 0x0, 0x10,
            OP_CODES.PUSH_VAR, 0x0, 0x0,
            OP_CODES.ACCESS_ALIAS, 0x1,
            OP_CODES.PUSH_VAR, 0x0, 0x1,
            OP_CODES.CALL_POP, 0x1,
            OP_CODES.INC, 0x0, 0x1,
            OP_CODES.GOTO, 0x0, 0x7,
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
});