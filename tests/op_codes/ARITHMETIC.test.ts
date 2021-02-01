
import { Interpreter, OP_CODES } from "../../src/Interpreter";
import { expect } from "chai";

describe("ARITHMETIC", () => {
    describe("ADD", () => {
    
        it("21 + 15 = 36", () => {
            const Evaler = new Interpreter(Buffer.from([
                0x0, 0x0,
                OP_CODES.PUSH_8, 0x15,
                OP_CODES.PUSH_8, 0xF,
                OP_CODES.ADD, 
                OP_CODES.END
            ]));
            Evaler.interpret();
            expect(Evaler.stack.pop()).to.be.equal(36);
        });

        it("21 + 'Hello world!'", () => {
            const Evaler = new Interpreter(Buffer.from([
                0x0, 0x0,
                OP_CODES.PUSH_8, 0x15,
                OP_CODES.PUSH_STR, 0x0, 0xC,
                0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64, 0x21,
                OP_CODES.ADD, 
                OP_CODES.END
            ]));
            Evaler.interpret();
            expect(Evaler.stack.pop()).to.be.equal("21Hello world!");
        });

    });

    it("SUB", () => {
        const Evaler = new Interpreter(Buffer.from([
            0x0, 0x0,
            OP_CODES.PUSH_8, 0x15,
            OP_CODES.PUSH_8, 0xF,
            OP_CODES.SUB, 
            OP_CODES.END
        ]));
        Evaler.interpret();
        expect(Evaler.stack.pop()).to.be.equal(6);
    });

    it("MUL", () => {
        const Evaler = new Interpreter(Buffer.from([
            0x0, 0x0,
            OP_CODES.PUSH_8, 0x2,
            OP_CODES.PUSH_8, 0xF,
            OP_CODES.MUL, 
            OP_CODES.END
        ]));
        Evaler.interpret();
        expect(Evaler.stack.pop()).to.be.equal(30);
    });

    it("DIV", () => {
        const Evaler = new Interpreter(Buffer.from([
            0x0, 0x0,
            OP_CODES.PUSH_8, 0x10,
            OP_CODES.PUSH_8, 0x2,
            OP_CODES.DIV, 
            OP_CODES.END
        ]));
        Evaler.interpret();
        expect(Evaler.stack.pop()).to.be.equal(8);
    });

    it("INC", () => {
        const Evaler = new Interpreter(Buffer.from([
            0x0, 0x1,
            OP_CODES.PUSH_8, 0x1,
            OP_CODES.LET,
            OP_CODES.INC, 0x0, 0x0,
            OP_CODES.INC, 0x0, 0x0,
            OP_CODES.INC, 0x0, 0x0,
            OP_CODES.END
        ]));
        Evaler.interpret();
        expect(Evaler.memory[0]).to.be.equal(4);
    });

    it("DEC", () => {
        const Evaler = new Interpreter(Buffer.from([
            0x0, 0x1,
            OP_CODES.PUSH_8, 0x1,
            OP_CODES.LET,
            OP_CODES.DEC, 0x0, 0x0,
            OP_CODES.DEC, 0x0, 0x0,
            OP_CODES.DEC, 0x0, 0x0,
            OP_CODES.END
        ]));
        Evaler.interpret();
        expect(Evaler.memory[0]).to.be.equal(-2);
    });
});