

import { expect } from "chai";
import {Compiler} from "../../src/Compiler";
import {Interpreter} from "../../src/Interpreter";


describe("COMPILER EXPORT", () => {

    it("Export string", () => {
        const compiler = new Compiler(
            `
            export something = "Thank you world!";
            `, {bufferSize: 100}
        );
        compiler.compile();
        const Evaler = new Interpreter(compiler.ctx.result);
        Evaler.interpret();
        expect(Evaler.exports.something).to.be.equal("Thank you world!");
    });

    it("Export number", () => {
        const compiler = new Compiler(
            `
            export ajajaja = 3.14;
            `, {bufferSize: 100}
        );
        compiler.compile();
        const Evaler = new Interpreter(compiler.ctx.result);
        Evaler.interpret();
        expect(Evaler.exports.ajajaja).to.be.approximately(3.14, 3);
    });
});


