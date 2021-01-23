
import { Interpreter, OP_CODES } from "../src/Interpreter";
import { expect } from "chai";

const Evaler = new Interpreter();

describe("Op Codes", () => {
    it("PUSH_32", () => {
        const code = Buffer.from([
            OP_CODES.PUSH_32, 0x40, 0x48, 0xf5, 0xc3, 
            OP_CODES.END
        ]);
        Evaler.clear().interpret(code);
        expect(Evaler.stack.pop()).to.be.approximately(3.14, 0.5);
    });

    it("PUSH_16", () => {
        const code = Buffer.from([
            OP_CODES.PUSH_16, 0x40, 0x48, 
            OP_CODES.END
        ]);
        Evaler.clear().interpret(code);
        expect(Evaler.stack.pop()).to.be.equal(16456);
    });

    it("PUSH_8", () => {
        const code = Buffer.from([
            OP_CODES.PUSH_8, 0x7f, 
            OP_CODES.END
        ]);
        Evaler.clear().interpret(code);
        expect(Evaler.stack.pop()).to.be.equal(127);
    });

    it("PUSH_BOOL", () => {
        const code = Buffer.from([
            OP_CODES.PUSH_BOOL, 0x1, 
            OP_CODES.END
        ]);
        Evaler.clear().interpret(code);
        expect(Evaler.stack.pop()).to.be.equal(true);
    });

    it("PUSH_STR", () => {
        const code = Buffer.from([
            OP_CODES.PUSH_STR, 0x0, 0xC,
            0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64, 0x21,
            OP_CODES.END
        ]);
        Evaler.clear().interpret(code);
        expect(Evaler.stack.pop()).to.be.equal("Hello world!");
    });

    it("PUSH_ARR", () => {
        const code = Buffer.from([
            OP_CODES.PUSH_STR, 0x0, 0xC,
            0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64, 0x21,
            OP_CODES.PUSH_8, 0x45,
            OP_CODES.PUSH_BOOL, 0x0,
            OP_CODES.PUSH_ARR, 0x0, 0x3,
            OP_CODES.END
        ]);
        Evaler.clear().interpret(code);
        const arr = Evaler.stack.pop();
        expect(arr[0]).to.be.equal("Hello world!");
        expect(arr[1]).to.be.equal(69);
        expect(arr[2]).to.be.equal(false);
    });

    it("ADD", () => {
        let code = Buffer.from([
            OP_CODES.PUSH_8, 0x15,
            OP_CODES.PUSH_8, 0xF,
            OP_CODES.ADD, 
            OP_CODES.END
        ]);
        Evaler.clear().interpret(code);
        expect(Evaler.stack.pop()).to.be.equal(36);

        code = Buffer.from([
            OP_CODES.PUSH_8, 0x15,
            OP_CODES.PUSH_STR, 0x0, 0xC,
            0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64, 0x21,
            OP_CODES.ADD, 
            OP_CODES.END
        ]);
        Evaler.clear().interpret(code);
        expect(Evaler.stack.pop()).to.be.equal("21Hello world!");
    });

    it("SUB", () => {
        const code = Buffer.from([
            OP_CODES.PUSH_8, 0x15,
            OP_CODES.PUSH_8, 0xF,
            OP_CODES.SUB, 
            OP_CODES.END
        ]);
        Evaler.clear().interpret(code);
        expect(Evaler.stack.pop()).to.be.equal(6);
    });

    it("MUL", () => {
        const code = Buffer.from([
            OP_CODES.PUSH_8, 0x2,
            OP_CODES.PUSH_8, 0xF,
            OP_CODES.MUL, 
            OP_CODES.END
        ]);
        Evaler.clear().interpret(code);
        expect(Evaler.stack.pop()).to.be.equal(30);
    });

    it("DIV", () => {
        const code = Buffer.from([
            OP_CODES.PUSH_8, 0x10,
            OP_CODES.PUSH_8, 0x2,
            OP_CODES.DIV, 
            OP_CODES.END
        ]);
        Evaler.clear().interpret(code);
        expect(Evaler.stack.pop()).to.be.equal(8);
    });

    it("ARITHMETIC", () => {
        const code = Buffer.from([
            OP_CODES.PUSH_8, 0xA,
            OP_CODES.PUSH_8, 0x2,
            OP_CODES.DIV,
            OP_CODES.PUSH_8, 0x1,
            OP_CODES.ADD,
            OP_CODES.END 
        ]);
        Evaler.clear().interpret(code);
        expect(Evaler.stack.pop()).to.be.equal(6);
    });

    it("EQUAL", () => {
        let code = Buffer.from([
            OP_CODES.PUSH_8, 0x10,
            OP_CODES.PUSH_8, 0x10,
            OP_CODES.EQUAL, 
            OP_CODES.END
        ]);
        Evaler.clear().interpret(code);
        expect(Evaler.stack.pop()).to.be.equal(true);

        code = Buffer.from([
            OP_CODES.PUSH_STR, 0x0, 0x5,
            0x68, 0x65, 0x6c, 0x6c, 0x6f,
            OP_CODES.PUSH_STR, 0x0, 0x5,
            0x48, 0x61, 0x6c, 0x6c, 0x6f,
            OP_CODES.EQUAL, 
            OP_CODES.END
        ]);

        Evaler.clear().interpret(code);
        expect(Evaler.stack.pop()).to.be.equal(false);
    });

    it("LET", () => {
        const code = Buffer.from([
            OP_CODES.PUSH_8, 0x5,
            OP_CODES.LET, 0x0, 0x0,
            OP_CODES.END
        ]);
        Evaler.clear().interpret(code);
        expect(Evaler.global.get(0)).to.be.equal(5);
    });

    it("ASSIGN", () => {
        const code = Buffer.from([
            OP_CODES.PUSH_8, 0x5,
            OP_CODES.LET, 0x0, 0x0,
            OP_CODES.PUSH_8, 0x2,
            OP_CODES.MUL,
            OP_CODES.ASSIGN, 0x0, 0x0,
            OP_CODES.END
        ]);
        Evaler.clear().interpret(code);
        expect(Evaler.global.get(0)).to.be.equal(10);
    });

    it("PUSH_VAR", () => {
        const code = Buffer.from([
            OP_CODES.PUSH_8, 0x5,
            OP_CODES.LET, 0x0, 0x0,
            OP_CODES.PUSH_8, 0x3,
            OP_CODES.LET, 0x0, 0x1,
            OP_CODES.PUSH_ARR, 0x0, 0x2,
            OP_CODES.LET, 0x0, 0x3,
            OP_CODES.END
        ]);
        Evaler.clear().interpret(code);
        expect(Evaler.global.get(3)).members([5, 3]);
    });

    it("ACCESS", () => {
        const code = Buffer.from([
            OP_CODES.PUSH_8, 0x5,
            OP_CODES.PUSH_8, 0x9,
            OP_CODES.PUSH_BOOL, 0x1,
            OP_CODES.PUSH_ARR, 0x0, 0x3,
            OP_CODES.LET, 0x0, 0x0,
            OP_CODES.ACCESS, 0x0, 0x0,
            OP_CODES.LET, 0x0, 0x1,
            OP_CODES.END
        ]);
        Evaler.clear().interpret(code);
        expect(Evaler.global.get(1)).to.be.equal(5);
    });

    
    it("ACCESS_STR", () => {
        const code = Buffer.from([
            OP_CODES.PUSH_VAR, 0x0, 0x0,
            OP_CODES.ACCESS_STR, 0x0, 0x6,
            0x6c, 0x65, 0x6e, 0x67, 0x74, 0x68,
            OP_CODES.LET, 0x0, 0x1,
            OP_CODES.END
        ]); // Same as: let a = b.length;
        Evaler.clear();
        Evaler.global.define(0, "Thank you world!");
        Evaler.interpret(code);
        expect(Evaler.global.get(1)).to.be.equal(16);
    });

    it("ACCESS_STR (Function)", () => {
        const code = Buffer.from([
            OP_CODES.PUSH_VAR, 0x0, 0x0,
            OP_CODES.ACCESS_STR, 0x0, 0x5,
            0x73, 0x70, 0x6c, 0x69, 0x74,
            OP_CODES.LET, 0x0, 0x1,
            OP_CODES.END
        ]); // Same as: let a = b.length;
        Evaler.clear();
        Evaler.global.define(0, "Thank you world!");
        Evaler.interpret(code);
        expect(Evaler.global.get(1)(" ")).members(["Thank", "you", "world!"]);
    });

    it("IF (Else) (JUMP_TRUE)", () => {
        const code = Buffer.from([
            OP_CODES.PUSH_UNDEFINED, OP_CODES.LET, 0x0, 0x1, // let a;
            OP_CODES.PUSH_VAR, 0x0, 0x0, // Push the variable "0" to the stack
            OP_CODES.JUMP_TRUE, 0x0, 0x5, // If the last pushed value is true, jump 5 bytes ahead
            OP_CODES.PUSH_8, 0x5, OP_CODES.ASSIGN, 0x0, 0x1, // If the variable "0" is false, set a to 5
            OP_CODES.PUSH_8, 0x9, OP_CODES.ASSIGN, 0x0, 0x1, // If the variable "0" is true, set a to 9
            OP_CODES.END
        ]);
        Evaler.clear();
        Evaler.global.define(0, true);
        Evaler.interpret(code);
        expect(Evaler.global.get(1)).to.be.equal(9);
    });

    it("IF (Else If, Else) (JUMP, JUMP_TRUE)", () => {
        const code = Buffer.from([
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
            OP_CODES.END
        ]);

        /**
         * Same as:
         * if (a === "yes") push 1;
         * else if (a === "no") push 2;
         * else push 3;
         * push 4;
         */
        Evaler.clear();
        Evaler.global.define(0, "yes");
        Evaler.interpret(code);
        expect(Evaler.stack).members([1, 4]);
    }); 

});

