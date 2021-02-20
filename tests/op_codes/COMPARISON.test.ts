
import { Interpreter, OP_CODES } from "../../src/Interpreter";
import { expect } from "chai";

describe("COMPARISON", () => {

    describe("AND", () => {
        it("undefined && 9", () => {
            const Evaler = new Interpreter(Buffer.from([
                0x0, 0x0,
                OP_CODES.PUSH_UNDEFINED,
                OP_CODES.PUSH_8, 0x9,
                OP_CODES.AND
            ]));
            Evaler.interpret();
            expect(Evaler.stack.pop()).to.be.equal(undefined);
        });

        it("1 && 3", () => {
            const Evaler = new Interpreter(Buffer.from([
                0x0, 0x0,
                OP_CODES.PUSH_BOOL, 0x1,
                OP_CODES.PUSH_8, 0x3,
                OP_CODES.AND
            ]));
            Evaler.interpret();
            expect(Evaler.stack.pop()).to.be.equal(3);
        });
    });

    describe("OR", () => {
        it("undefined || 9", () => {
            const Evaler = new Interpreter(Buffer.from([
                0x0, 0x0,
                OP_CODES.PUSH_UNDEFINED,
                OP_CODES.PUSH_8, 0x9,
                OP_CODES.OR
            ]));
            Evaler.interpret();
            expect(Evaler.stack.pop()).to.be.equal(9);
        });

        it("0 || 0", () => {
            const Evaler = new Interpreter(Buffer.from([
                0x0, 0x0,
                OP_CODES.PUSH_BOOL, 0x0,
                OP_CODES.PUSH_8, 0x0,
                OP_CODES.AND
            ]));
            Evaler.interpret();
            expect(Evaler.stack.pop()).to.be.equal(false);
        });
    });

    describe("EQUAL", () => {
        it("10 === 10", () => {
            const Evaler = new Interpreter(Buffer.from([
                0x0, 0x0,
                OP_CODES.PUSH_8, 0x10,
                OP_CODES.PUSH_8, 0x10,
                OP_CODES.EQUAL
            ]));
            Evaler.interpret();
            expect(Evaler.stack.pop()).to.be.equal(true);
        });

        it("'hello' === 'hallo'", () => {
            const Evaler = new Interpreter(Buffer.from([
                0x0, 0x0,
                OP_CODES.PUSH_STR, 0x0, 0x5,
                0x68, 0x65, 0x6c, 0x6c, 0x6f,
                OP_CODES.PUSH_STR, 0x0, 0x5,
                0x48, 0x61, 0x6c, 0x6c, 0x6f,
                OP_CODES.EQUAL
            ]));
            Evaler.interpret();
            expect(Evaler.stack.pop()).to.be.equal(false);
        });
    });

    it("NOT", () => {
        const Evaler = new Interpreter(Buffer.from([
            0x0, 0x0,
            OP_CODES.PUSH_8, 0x0,
            OP_CODES.NOT
        ]));
        Evaler.interpret();
        expect(Evaler.stack.pop()).to.be.equal(true);
    });

    describe("LESS_THAN", () => {

        it("5 < 1", () => {
            const Evaler = new Interpreter(Buffer.from([
                0x0, 0x0,
                OP_CODES.PUSH_8, 0x5,
                OP_CODES.PUSH_8, 0x1,
                OP_CODES.LESS_THAN
            ]));
            Evaler.interpret();
            expect(Evaler.stack.pop()).to.be.equal(false);
        });

        it("1 < 8", () => {
            const Evaler = new Interpreter(Buffer.from([
                0x0, 0x0,
                OP_CODES.PUSH_8, 0x1,
                OP_CODES.PUSH_8, 0x8,
                OP_CODES.LESS_THAN
            ]));
            Evaler.interpret();
            expect(Evaler.stack.pop()).to.be.equal(true);
        });
    });

    describe("LESS_OR_EQUAL", () => {
        it("5 <= 5", () => {
            const Evaler = new Interpreter(Buffer.from([
                0x0, 0x0,
                OP_CODES.PUSH_8, 0x5,
                OP_CODES.PUSH_8, 0x5,
                OP_CODES.LESS_OR_EQUAL
            ]));
            Evaler.interpret();
            expect(Evaler.stack.pop()).to.be.equal(true);
        });

        it("3 <= 5", () => {
            const Evaler = new Interpreter(Buffer.from([
                0x0, 0x0,
                OP_CODES.PUSH_8, 0x3,
                OP_CODES.PUSH_8, 0x5,
                OP_CODES.LESS_OR_EQUAL
            ]));
            Evaler.interpret();
            expect(Evaler.stack.pop()).to.be.equal(true);
        });

        it("10 <= 5", () => {
            const Evaler = new Interpreter(Buffer.from([
                0x0, 0x0,
                OP_CODES.PUSH_8, 0x10,
                OP_CODES.PUSH_8, 0x5,
                OP_CODES.LESS_OR_EQUAL
            ]));
            Evaler.interpret();
            expect(Evaler.stack.pop()).to.be.equal(false);
        });
    });

    describe("GREATER_THAN", () => {
        it("5 > 10", () => {
            const Evaler = new Interpreter(Buffer.from([
                0x0, 0x0,
                OP_CODES.PUSH_8, 0x5,
                OP_CODES.PUSH_8, 0x10,
                OP_CODES.GREATER_THAN
            ]));
            Evaler.interpret();
            expect(Evaler.stack.pop()).to.be.equal(false);
        });

        it("'hi'.length > 'hello'.length", () => {
            const Evaler = new Interpreter(Buffer.from([
                0x0, 0x0,
                OP_CODES.PUSH_STR, 0x0, 0x2, 0x68, 0x69,
                OP_CODES.ACCESS_STR, 0x0, 0x6, 0x6c, 0x65, 0x6e, 0x67, 0x74, 0x68,
                OP_CODES.PUSH_STR, 0x0, 0x5, 0x68, 0x65, 0x6c, 0x6c, 0x6f,
                OP_CODES.ACCESS_STR, 0x0, 0x6, 0x6c, 0x65, 0x6e, 0x67, 0x74, 0x68,
                OP_CODES.GREATER_THAN
            ]));
            Evaler.interpret();
            expect(Evaler.stack.pop()).to.be.equal(false);
        });
    });

    describe("GREATER_OR_EQUAL", () => {
        it("5 >= 8", () => {
            const Evaler = new Interpreter(Buffer.from([
                0x0, 0x0,
                OP_CODES.PUSH_8, 0x5,
                OP_CODES.PUSH_8, 0x8,
                OP_CODES.GREATER_OR_EQUAL
            ]));
            Evaler.interpret();
            expect(Evaler.stack.pop()).to.be.equal(false);
        });

        it("[1, 2, 3].length >= 'hii'.length", () => {
            const Evaler = new Interpreter(Buffer.from([
                0x0, 0x0,
                OP_CODES.PUSH_8, 0x1,
                OP_CODES.PUSH_8, 0x2,
                OP_CODES.PUSH_8, 0x3, 
                OP_CODES.PUSH_ARR, 0x0, 0x3,
                OP_CODES.ACCESS_STR, 0x0, 0x6, 0x6c, 0x65, 0x6e, 0x67, 0x74, 0x68,
                OP_CODES.PUSH_STR, 0x0, 0x3, 0x68, 0x69, 0x69,
                OP_CODES.ACCESS_STR, 0x0, 0x6, 0x6c, 0x65, 0x6e, 0x67, 0x74, 0x68,
                OP_CODES.GREATER_OR_EQUAL
            ]));
            Evaler.interpret();
            expect(Evaler.stack.pop()).to.be.equal(true);
        });
    });

});