
import { Interpreter, OP_CODES } from "../../src/Interpreter";
import { expect } from "chai";


describe("PUSH", () => {
    it("PUSH_32", () => {
        const Evaler = new Interpreter(Buffer.from([
            0x0, 0x0,
            OP_CODES.PUSH_32, 0x40, 0x48, 0xf5, 0xc3, 
            OP_CODES.END
        ]));
        Evaler.interpret();
        expect(Evaler.stack.pop()).to.be.approximately(3.14, 0.5);
    });
    
    it("PUSH_16", () => {
        const Evaler = new Interpreter(Buffer.from([
            0x0, 0x0,
            OP_CODES.PUSH_16, 0x40, 0x48, 
            OP_CODES.END
        ]));
        Evaler.interpret();
        expect(Evaler.stack.pop()).to.be.equal(16456);
    });
    
    it("PUSH_8", () => {
        const Evaler = new Interpreter(Buffer.from([
            0x0, 0x0,
            OP_CODES.PUSH_8, 0x7f, 
            OP_CODES.END
        ]));
        Evaler.interpret();
        expect(Evaler.stack.pop()).to.be.equal(127);
    });
    
    it("PUSH_BOOL", () => {
        const Evaler = new Interpreter(Buffer.from([
            0x0, 0x0,
            OP_CODES.PUSH_BOOL, 0x1, 
            OP_CODES.END
        ]));
        Evaler.interpret();
        expect(Evaler.stack.pop()).to.be.equal(true);
    });
    
    it("PUSH_STR", () => {
        const Evaler = new Interpreter(Buffer.from([
            0x0, 0x0,
            OP_CODES.PUSH_STR, 0x0, 0xC,
            0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64, 0x21,
            OP_CODES.END
        ]));
        Evaler.interpret();
        expect(Evaler.stack.pop()).to.be.equal("Hello world!");
    });
    
    it("PUSH_ARR", () => {
        const Evaler = new Interpreter(Buffer.from([
            0x0, 0x0,
            OP_CODES.PUSH_STR, 0x0, 0xC,
            0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64, 0x21,
            OP_CODES.PUSH_8, 0x45,
            OP_CODES.PUSH_BOOL, 0x0,
            OP_CODES.PUSH_ARR, 0x0, 0x3,
            OP_CODES.END
        ]));
        Evaler.interpret();
        const arr = Evaler.stack.pop();
        expect(arr[0]).to.be.equal("Hello world!");
        expect(arr[1]).to.be.equal(69);
        expect(arr[2]).to.be.equal(false);
    });

});