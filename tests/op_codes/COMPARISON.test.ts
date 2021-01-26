
import { Interpreter, OP_CODES } from "../../src/Interpreter";
import { expect } from "chai";

const Evaler = new Interpreter();

describe("COMPARISON", () => {

    describe("AND", () => {
        it("undefined && 9", () => {
            Evaler.clear().interpret(Buffer.from([
                OP_CODES.PUSH_UNDEFINED,
                OP_CODES.PUSH_8, 0x9,
                OP_CODES.AND,
                OP_CODES.END
            ]));
            expect(Evaler.stack.pop()).to.be.equal(undefined);
        });

        it("1 && 3", () => {
            Evaler.clear().interpret(Buffer.from([
                OP_CODES.PUSH_BOOL, 0x1,
                OP_CODES.PUSH_8, 0x3,
                OP_CODES.AND,
                OP_CODES.END
            ]));
            expect(Evaler.stack.pop()).to.be.equal(3);
        });
    });

    describe("OR", () => {
        it("undefined || 9", () => {
            Evaler.clear().interpret(Buffer.from([
                OP_CODES.PUSH_UNDEFINED,
                OP_CODES.PUSH_8, 0x9,
                OP_CODES.OR,
                OP_CODES.END
            ]));
            expect(Evaler.stack.pop()).to.be.equal(9);
        });

        it("0 || 0", () => {
            Evaler.clear().interpret(Buffer.from([
                OP_CODES.PUSH_BOOL, 0x0,
                OP_CODES.PUSH_8, 0x0,
                OP_CODES.AND,
                OP_CODES.END
            ]));
            expect(Evaler.stack.pop()).to.be.equal(false);
        });
    });

    describe("EQUAL", () => {
        it("10 === 10", () => {
            Evaler.clear().interpret(Buffer.from([
                OP_CODES.PUSH_8, 0x10,
                OP_CODES.PUSH_8, 0x10,
                OP_CODES.EQUAL, 
                OP_CODES.END
            ]));
            expect(Evaler.stack.pop()).to.be.equal(true);
        });

        it("'hello' === 'hallo'", () => {
            Evaler.clear().interpret(Buffer.from([
                OP_CODES.PUSH_STR, 0x0, 0x5,
                0x68, 0x65, 0x6c, 0x6c, 0x6f,
                OP_CODES.PUSH_STR, 0x0, 0x5,
                0x48, 0x61, 0x6c, 0x6c, 0x6f,
                OP_CODES.EQUAL, 
                OP_CODES.END
            ]));
            expect(Evaler.stack.pop()).to.be.equal(false);
        });
    });

    it("NOT", () => {
        const code = Buffer.from([
            OP_CODES.PUSH_8, 0x0,
            OP_CODES.NOT,
            OP_CODES.END 
        ]);
        Evaler.clear().interpret(code);
        expect(Evaler.stack.pop()).to.be.equal(true);
    });

    describe("LESS_THAN", () => {

        it("5 < 1", () => {
            Evaler.clear().interpret(Buffer.from([
                OP_CODES.PUSH_8, 0x5,
                OP_CODES.PUSH_8, 0x1,
                OP_CODES.LESS_THAN,
                OP_CODES.END
            ]));
            expect(Evaler.stack.pop()).to.be.equal(false);
        });

        it("1 < 8", () => {
            Evaler.clear().interpret(Buffer.from([
                OP_CODES.PUSH_8, 0x1,
                OP_CODES.PUSH_8, 0x8,
                OP_CODES.LESS_THAN,
                OP_CODES.END
            ]));
            expect(Evaler.stack.pop()).to.be.equal(true);
        });
    });

    describe("LESS_OR_EQUAL", () => {
        it("5 <= 5", () => {
            Evaler.clear().interpret(Buffer.from([
                OP_CODES.PUSH_8, 0x5,
                OP_CODES.PUSH_8, 0x5,
                OP_CODES.LESS_OR_EQUAL,
                OP_CODES.END
            ]));
            expect(Evaler.stack.pop()).to.be.equal(true);
        });

        it("3 <= 5", () => {
            Evaler.clear().interpret(Buffer.from([
                OP_CODES.PUSH_8, 0x3,
                OP_CODES.PUSH_8, 0x5,
                OP_CODES.LESS_OR_EQUAL,
                OP_CODES.END
            ]));
            expect(Evaler.stack.pop()).to.be.equal(true);
        });

        it("10 <= 5", () => {
            Evaler.clear().interpret(Buffer.from([
                OP_CODES.PUSH_8, 0x10,
                OP_CODES.PUSH_8, 0x5,
                OP_CODES.LESS_OR_EQUAL,
                OP_CODES.END
            ]));
            expect(Evaler.stack.pop()).to.be.equal(false);
        });
    });

    describe("GREATER_THAN", () => {
        it("5 > 10", () => {
            Evaler.clear().interpret(Buffer.from([
                OP_CODES.PUSH_8, 0x5,
                OP_CODES.PUSH_8, 0x10,
                OP_CODES.GREATER_THAN,
                OP_CODES.END
            ]));
            expect(Evaler.stack.pop()).to.be.equal(false);
        });

        it("'hi'.length > 'hello'.length", () => {
            Evaler.clear().interpret(Buffer.from([
                OP_CODES.PUSH_STR, 0x0, 0x2, 0x68, 0x69,
                OP_CODES.ACCESS_STR, 0x0, 0x6, 0x6c, 0x65, 0x6e, 0x67, 0x74, 0x68,
                OP_CODES.PUSH_STR, 0x0, 0x5, 0x68, 0x65, 0x6c, 0x6c, 0x6f,
                OP_CODES.ACCESS_STR, 0x0, 0x6, 0x6c, 0x65, 0x6e, 0x67, 0x74, 0x68,
                OP_CODES.GREATER_THAN,
                OP_CODES.END
            ]));
            expect(Evaler.stack.pop()).to.be.equal(false);
        });
    });

    describe("GREATER_OR_EQUAL", () => {
        it("5 >= 8", () => {
            Evaler.clear().interpret(Buffer.from([
                OP_CODES.PUSH_8, 0x5,
                OP_CODES.PUSH_8, 0x8,
                OP_CODES.GREATER_OR_EQUAL,
                OP_CODES.END
            ]));
            expect(Evaler.stack.pop()).to.be.equal(false);
        });

        it("[1, 2, 3].length >= 'hii'.length", () => {
            Evaler.clear().interpret(Buffer.from([
                OP_CODES.PUSH_8, 0x1,
                OP_CODES.PUSH_8, 0x2,
                OP_CODES.PUSH_8, 0x3, 
                OP_CODES.PUSH_ARR, 0x0, 0x3,
                OP_CODES.ACCESS_STR, 0x0, 0x6, 0x6c, 0x65, 0x6e, 0x67, 0x74, 0x68,
                OP_CODES.PUSH_STR, 0x0, 0x3, 0x68, 0x69, 0x69,
                OP_CODES.ACCESS_STR, 0x0, 0x6, 0x6c, 0x65, 0x6e, 0x67, 0x74, 0x68,
                OP_CODES.GREATER_OR_EQUAL,
                OP_CODES.END
            ]));
            expect(Evaler.stack.pop()).to.be.equal(true);
        });
    });

});