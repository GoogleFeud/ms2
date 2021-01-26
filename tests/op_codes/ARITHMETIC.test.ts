
import { Interpreter, OP_CODES } from "../../src/Interpreter";
import { expect } from "chai";

const Evaler = new Interpreter();

describe("ARITHMETIC", () => {
    describe("ADD", () => {
    
        it("21 + 15 = 36", () => {
            const code = Buffer.from([
                OP_CODES.PUSH_8, 0x15,
                OP_CODES.PUSH_8, 0xF,
                OP_CODES.ADD, 
                OP_CODES.END
            ]);
            Evaler.clear().interpret(code);
            expect(Evaler.stack.pop()).to.be.equal(36);
        });

        it("21 + 'Hello world!'", () => {
            const code = Buffer.from([
                OP_CODES.PUSH_8, 0x15,
                OP_CODES.PUSH_STR, 0x0, 0xC,
                0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64, 0x21,
                OP_CODES.ADD, 
                OP_CODES.END
            ]);
            Evaler.clear().interpret(code);
            expect(Evaler.stack.pop()).to.be.equal("21Hello world!");
        });

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

    it("INC", () => {
        Evaler.clear().interpret(Buffer.from([
            OP_CODES.PUSH_8, 0x1,
            OP_CODES.LET, 0x0, 0x0,
            OP_CODES.INC, 0x0, 0x0,
            OP_CODES.INC, 0x0, 0x0,
            OP_CODES.INC, 0x0, 0x0,
            OP_CODES.END
        ]));
        expect(Evaler.global.get(0)).to.be.equal(4);
    });

    it("DEC", () => {
        Evaler.clear().interpret(Buffer.from([
            OP_CODES.PUSH_8, 0x1,
            OP_CODES.LET, 0x0, 0x0,
            OP_CODES.DEC, 0x0, 0x0,
            OP_CODES.DEC, 0x0, 0x0,
            OP_CODES.DEC, 0x0, 0x0,
            OP_CODES.END
        ]));
        expect(Evaler.global.get(0)).to.be.equal(-2);
    });
});