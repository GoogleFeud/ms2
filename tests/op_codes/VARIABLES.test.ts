
import { Interpreter, OP_CODES } from "../../src/Interpreter";
import { expect } from "chai";

const Evaler = new Interpreter();

describe("VARIABLES", () => {
        
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
        ]); // Same as: let a = "Thank you world!".split.bind("Thank you world!");
        Evaler.clear();
        Evaler.global.define(0, "Thank you world!");
        Evaler.interpret(code);
        expect(Evaler.global.get(1)(" ")).members(["Thank", "you", "world!"]);
    });

    it("ACCESS_ALIAS (Function)", () => {
        Evaler.clear().global.define(0, "Thank you world!");
        Evaler.interpret(Buffer.from([
            OP_CODES.PUSH_VAR, 0x0, 0x0,
            OP_CODES.ACCESS_ALIAS, 0x23, 
            OP_CODES.LET, 0x0, 0x1,
            OP_CODES.END
        ]));
        expect(Evaler.global.get(1)(" ")).members(["Thank", "you", "world!"]);
    });

});