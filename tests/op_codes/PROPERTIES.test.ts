
import { Interpreter, OP_CODES } from "../../src/Interpreter";
import { addPropertyAlias } from "../../src/util";
import { expect } from "chai";

describe("PROPERTIES", () => {

    it("Access property of array", () => {
        const Evaler = new Interpreter(Buffer.from([
            0x0, 0x0,
            OP_CODES.PUSH_8, 0x1,
            OP_CODES.PUSH_8, 0x2,
            OP_CODES.PUSH_ARR, 0x0, 0x2,
            OP_CODES.ACCESS, 0x0, 0x0,
            OP_CODES.END
        ]));
        
        Evaler.interpret();
        expect(Evaler.stack[0]).to.be.equal(1);
    });

    it("Access property of 2d array", () => {
        const Evaler = new Interpreter(Buffer.from([
            0x0, 0x0,
            OP_CODES.PUSH_8, 0x1,
            OP_CODES.PUSH_8, 0x2,
            OP_CODES.PUSH_ARR, 0x0, 0x2,
            OP_CODES.PUSH_ARR, 0x0, 0x1,
            OP_CODES.ACCESS, 0x0, 0x0,
            OP_CODES.ACCESS, 0x0, 0x1,
            OP_CODES.END
        ]));
        Evaler.interpret();
        expect(Evaler.stack[0]).to.be.equal(2);
    });

    it("Access property of imported object", () => {
        const [indexOfA] = addPropertyAlias("a");
        const Evaler = new Interpreter(Buffer.from([
            0x0, 0x1,
            OP_CODES.PUSH_VAR, 0x0, 0x0,
            OP_CODES.ACCESS_ALIAS, indexOfA,
            OP_CODES.END
        ]));
        Evaler.addGlobal({a: 15});
        Evaler.interpret();
        expect(Evaler.stack[0]).to.be.equal(15);
    });

    it("Access property of nested objects", () => {
        const [indexOfA, indexOfSomething] = addPropertyAlias("a", "something");
        const Evaler = new Interpreter(Buffer.from([
            0x0, 0x1,
            OP_CODES.PUSH_VAR, 0x0, 0x0,
            OP_CODES.ACCESS_ALIAS, indexOfA,
            OP_CODES.ACCESS_ALIAS, indexOfSomething,
            OP_CODES.END
        ]));
        Evaler.addGlobal({a: {something: 3.14}});
        Evaler.interpret();
        expect(Evaler.stack[0]).to.be.closeTo(3.14, 2);
    });

    it("Set item in array", () => {
        const Evaler = new Interpreter(Buffer.from([
            0x0, 0x1,
            OP_CODES.PUSH_8, 0x0,
            OP_CODES.PUSH_8, 0x1,
            OP_CODES.PUSH_8, 0x2,
            OP_CODES.PUSH_ARR, 0x0, 0x3,
            OP_CODES.LET,
            OP_CODES.PUSH_8, 0x0,
            OP_CODES.PUSH_8, 0xA,
            OP_CODES.ASSIGN_PROP,
            OP_CODES.END
        ]));
        Evaler.interpret();
        expect(Evaler.memory[0]).members([10, 1, 2]);
    });

    it("Set property in imported object", () => {
        const [indexOfName, indexOfFunc] = addPropertyAlias("name", "something");
        const Evaler = new Interpreter(Buffer.from([
            0x0, 0x1,
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
        Evaler.addGlobal({
            name: {
                something: () => "Volen"
            }
        });
        Evaler.interpret();
        expect(Evaler.memory[0].name.something.call()).to.be.equal("Hidden");
    });

    describe("Optional chaining", () => {

        it("value.undefined.undefined", () => {
            const [indexOfPerson, indexOfSecrets, indexOfLies] = addPropertyAlias("person", "secrets", "lies");
            const Evaler = new Interpreter(Buffer.from([
                0x0, 0x1,
                OP_CODES.PUSH_VAR, 0x0, 0x0,
                OP_CODES.ACCESS_ALIAS_OPTIONAL, indexOfPerson,
                OP_CODES.ACCESS_ALIAS_OPTIONAL, indexOfSecrets,
                OP_CODES.ACCESS_ALIAS_OPTIONAL, indexOfLies,
                OP_CODES.END
            ]));
            Evaler.addGlobal({
                person: {
                    secrets: undefined
                }
            });
            Evaler.interpret();
            expect(Evaler.stack.pop()).to.be.equal(undefined);
        });

        
        it("value.value.value", () => {
            const [indexOfPerson, indexOfSecrets, indexOfLies] = addPropertyAlias("person", "secrets", "lies");
            const Evaler = new Interpreter(Buffer.from([
                0x0, 0x1,
                OP_CODES.PUSH_VAR, 0x0, 0x0,
                OP_CODES.ACCESS_ALIAS_OPTIONAL, indexOfPerson,
                OP_CODES.ACCESS_ALIAS_OPTIONAL, indexOfSecrets,
                OP_CODES.ACCESS_ALIAS_OPTIONAL, indexOfLies,
                OP_CODES.END
            ]));
            Evaler.addGlobal({
                person: {
                    secrets: {
                        lies: 10
                    }
                }
            });
            Evaler.interpret();
            expect(Evaler.stack.pop()).to.be.equal(10);
        });


    });

});