
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

    it("IF (Else)", () => {
        const code = Buffer.from([
            OP_CODES.PUSH_UNDEFINED,
            OP_CODES.LET, 0x0, 0x1,
            OP_CODES.PUSH_VAR, 0x0, 0x0,
            OP_CODES.IF_BLOCK_START, 0x0, 0x6,
            OP_CODES.PUSH_8, 0x9,
            OP_CODES.ASSIGN, 0x0, 0x1,
            OP_CODES.IF_BLOCK_END,
            OP_CODES.IF_BLOCK_START, 0x0, 0x6,
            OP_CODES.PUSH_8, 0x5,
            OP_CODES.ASSIGN, 0x0, 0x1,
            OP_CODES.IF_BLOCK_END,
            OP_CODES.END
        ]);
        Evaler.clear();
        Evaler.global.define(0, false);
        Evaler.interpret(code);
        expect(Evaler.global.get(1)).to.be.equal(5);
    });

    it("IF (Else If, Else)", () => {
        const code = Buffer.from([
            OP_CODES.PUSH_UNDEFINED, OP_CODES.LET, 0x0, 0x1, // let res = undefined;
            OP_CODES.PUSH_STR, 0x0, 0x2, 0x6e, 0x6f, OP_CODES.PUSH_VAR, 0x0, 0x0, OP_CODES.EQUAL, OP_CODES.IF_BLOCK_START, 0x0, 0x6, // if (a === "no") {
            OP_CODES.PUSH_8, 0x9, OP_CODES.ASSIGN, 0x0, 0x1, // res = 9;
            OP_CODES.IF_BLOCK_END, // }
            OP_CODES.PUSH_STR, 0x0, 0x3, 0x79, 0x65, 0x73, OP_CODES.PUSH_VAR, 0x0, 0x0, OP_CODES.EQUAL, // "yes" === a
            OP_CODES.IF_BLOCK_START, 0x0, 0x6,
            OP_CODES.PUSH_8, 0x5, OP_CODES.ASSIGN, 0x0, 0x1, // res = 5;
            OP_CODES.IF_BLOCK_END,
            OP_CODES.IF_BLOCK_START, 0x0, 0x6,
            OP_CODES.PUSH_8, 0x3, OP_CODES.ASSIGN, 0x0, 0x1, // res = 3;
            OP_CODES.IF_BLOCK_END,
            OP_CODES.END
        ]);
        /**
         * Same as:
         * if (a === "no") {
         *    res = 9;
         * } else if (a === "yes") {
         *    res = 5;
         * } else {
         *    res = 3;
         * }
         */

        Evaler.clear();
        Evaler.global.define(0, "no");
        Evaler.interpret(code);
        expect(Evaler.global.get(1)).to.be.equal(9);
    }); 

});

