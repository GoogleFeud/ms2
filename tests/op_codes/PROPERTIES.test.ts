
import { Interpreter, OP_CODES } from "../../src/Interpreter";
import { addPropertyAlias } from "../../src/util";
import { expect } from "chai";

const Evaler = new Interpreter();

describe("PROPERTIES", () => {

    it("Access property of array", () => {
        Evaler.clear().interpret(Buffer.from([
            OP_CODES.PUSH_8, 0x1,
            OP_CODES.PUSH_8, 0x2,
            OP_CODES.PUSH_ARR, 0x0, 0x2,
            OP_CODES.ACCESS, 0x0, 0x0,
            OP_CODES.END
        ]));
        expect(Evaler.stack[0]).to.be.equal(1);
    });

    it("Access property of 2d array", () => {
        Evaler.clear().interpret(Buffer.from([
            OP_CODES.PUSH_8, 0x1,
            OP_CODES.PUSH_8, 0x2,
            OP_CODES.PUSH_ARR, 0x0, 0x2,
            OP_CODES.PUSH_ARR, 0x0, 0x1,
            OP_CODES.ACCESS, 0x0, 0x0,
            OP_CODES.ACCESS, 0x0, 0x1,
            OP_CODES.END
        ]));
        expect(Evaler.stack[0]).to.be.equal(2);
    });

    it("Access property of imported object", () => {
        Evaler.clear();
        const [indexOfA] = addPropertyAlias("a");
        Evaler.global.define(0, {a: 15});
        Evaler.interpret(Buffer.from([
            OP_CODES.PUSH_VAR, 0x0, 0x0,
            OP_CODES.ACCESS_ALIAS, indexOfA,
            OP_CODES.END
        ]));
        expect(Evaler.stack[0]).to.be.equal(15);
    });

    it("Access property of nested objects", () => {
        Evaler.clear();
        const [indexOfA, indexOfSomething] = addPropertyAlias("a", "something");
        Evaler.global.define(0, {a: {something: 3.14}});
        Evaler.interpret(Buffer.from([
            OP_CODES.PUSH_VAR, 0x0, 0x0,
            OP_CODES.ACCESS_ALIAS, indexOfA,
            OP_CODES.ACCESS_ALIAS, indexOfSomething,
            OP_CODES.END
        ]));
        expect(Evaler.stack[0]).to.be.closeTo(3.14, 2);
    });

    it("Set item in array", () => {
        Evaler.clear().interpret(Buffer.from([
            OP_CODES.PUSH_8, 0x0,
            OP_CODES.PUSH_8, 0x1,
            OP_CODES.PUSH_8, 0x2,
            OP_CODES.PUSH_ARR, 0x0, 0x3,
            OP_CODES.LET, 0x0, 0x0,
            OP_CODES.PUSH_8, 0x0,
            OP_CODES.PUSH_8, 0xA,
            OP_CODES.ASSIGN_PROP,
            OP_CODES.END
        ]));
        expect(Evaler.global.get(0)).members([10, 1, 2]);
    });

    it("Set property in imported object", () => {
        Evaler.clear();
        const [indexOfName, indexOfFunc] = addPropertyAlias("name", "something");
        Evaler.global.define(0, {
            name: {
                something: () => "Volen"
            }
        });
        Evaler.interpret(Buffer.from([
            OP_CODES.PUSH_VAR, 0x0, 0x0,
            OP_CODES.ACCESS_ALIAS, indexOfName,
            OP_CODES.PUSH_8, indexOfFunc,
            OP_CODES.FN_START, 0x0, 0xA,
            OP_CODES.PUSH_STR, 0x0, 0x6, 0x48, 0x69, 0x64, 0x64, 0x65, 0x6e,
            OP_CODES.RETURN,
            OP_CODES.FN_END,
            OP_CODES.ASSIGN_PROP_ALIAS_POP,
            OP_CODES.END
        ]));
        expect(Evaler.global.get(0).name.something.call()).to.be.equal("Hidden");
    });

});