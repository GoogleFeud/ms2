
import { Interpreter, OP_CODES } from "../../src/Interpreter";
import { expect } from "chai";


describe("IF", () => {
    it("if...else", () => {
        const Evaler = new Interpreter(Buffer.from([
            0x0, 0x2,
            OP_CODES.PUSH_UNDEFINED, OP_CODES.LET, // let a;
            OP_CODES.PUSH_VAR, 0x0, 0x0, // Push the variable "0" to the stack
            OP_CODES.JUMP_TRUE, 0x0, 0x5, // If the last pushed value is true, jump 5 bytes ahead
            OP_CODES.PUSH_8, 0x5, OP_CODES.ASSIGN, 0x0, 0x1, // If the variable "0" is false, set a to 5
            OP_CODES.PUSH_8, 0x9, OP_CODES.ASSIGN, 0x0, 0x1, // If the variable "0" is true, set a to 9
        ]));
        Evaler.addGlobal(true);
        Evaler.interpret();
        expect(Evaler.memory[1]).to.be.equal(9);
    });
    
    it("IF...else if...else", () => {
        const Evaler = new Interpreter(Buffer.from([
            0x0, 0x1,
            /**0 */ OP_CODES.PUSH_VAR, 0x0, 0x0, // Push variable 0 to stack
            /**1 */ OP_CODES.PUSH_STR, 0x0, 0x3, 0x79, 0x65, 0x73, // Push string "yes" to stack,
            /**2 */ OP_CODES.EQUAL, // Check if the value in variable 0 is equal to "yes"
            /**3 */ OP_CODES.JUMP_TRUE, 0x0, 0x16, // If they are equal, execute the code on line 12
            /**4 */ OP_CODES.PUSH_VAR, 0x0, 0x0,
            /**5 */ OP_CODES.PUSH_STR, 0x0, 0x2, 0x6e, 0x6f,
            /**6 */ OP_CODES.EQUAL,
            /* 7 */ OP_CODES.JUMP_TRUE, 0x0, 0x5, // if 0 === "no" jump to 10
            /* 8 */ OP_CODES.PUSH_8, 0x3, // if var 0 not equal to "no" or "yes", push 3 to stack
            /* 9 */ OP_CODES.JUMP, 0x0, 0x7,
            /* 10 */ OP_CODES.PUSH_8, 0x2, // if var 0 === "no" push 2 to stack.
            /* 11 */ OP_CODES.JUMP, 0x0, 0x2,
            /**12 */ OP_CODES.PUSH_8, 0x1, // if var 0 === "yes" push 1 to stack.
            OP_CODES.PUSH_8, 0x4,
        ]));
    
        /**
             * Same as:
             * if (a === "yes") push 1;
             * else if (a === "no") push 2;
             * else push 3;
             * push 4;
             */
        Evaler.addGlobal("yes");
        Evaler.interpret();
        expect(Evaler.stack).members([1, 4]);
    }); 
});