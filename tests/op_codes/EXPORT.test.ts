
import { Interpreter, OP_CODES } from "../../src/Interpreter";
import { expect } from "chai";
import { addPropertyAlias } from "../../src/util";

const Evaler = new Interpreter();

describe("EXPORT", () => {
    const code = Buffer.from([
        OP_CODES.PUSH_8, 0x5,
        OP_CODES.EXPORT, 0x0, 0x7, 0x73, 0x6f, 0x6d, 0x65, 0x4e, 0x75, 0x6d,
        OP_CODES.END
    ]);
    Evaler.clear().interpret(code);
    expect(Evaler.exports.someNum).to.be.equal(5);

});

describe("EXPORT_ALIAS", () => {
    const [toBeExported] = addPropertyAlias("someNum");
    const code = Buffer.from([
        OP_CODES.PUSH_8, 0x3,
        OP_CODES.EXPORT_ALIAS, toBeExported, 
        OP_CODES.END
    ]);
    Evaler.clear().interpret(code);
    expect(Evaler.exports.someNum).to.be.equal(3);
});