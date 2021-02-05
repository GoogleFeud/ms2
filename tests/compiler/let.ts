


import { expect } from "chai";
import {Compiler} from "../../src/Compiler";
import {Interpreter} from "../../src/Interpreter";


describe("COMPILER LET", () => {

    it("Define one variable with initializer", () => {
        const compiler = new Compiler(
            `
            let myVar = true
            `, {bufferSize: 100}
        );
        compiler.compile();
        const Evaler = new Interpreter(compiler.ctx.result);
        Evaler.interpret();
        expect(Evaler.memory[0]).to.be.equal(true);
    });

    it("Define one variable with no value", () => {
        const compiler = new Compiler(
            `
            let myVar
            let myVar2;
            `, {bufferSize: 100}
        );
        compiler.compile();
        const Evaler = new Interpreter(compiler.ctx.result);
        Evaler.interpret();
        expect(Evaler.memory[0]).to.be.equal(undefined);
        expect(Evaler.memory[2]).to.be.equal(undefined);
    });

    it("Define multiple variable with initializer", () => {
        const compiler = new Compiler(
            `
            let myVar, myVar2, myVar3, myVar4 = 100;
            `, {bufferSize: 100}
        );
        compiler.compile();
        const Evaler = new Interpreter(compiler.ctx.result);
        Evaler.interpret();
        expect(Evaler.memory[0]).to.be.equal(100);
        expect(Evaler.memory[1]).to.be.equal(100);
        expect(Evaler.memory[2]).to.be.equal(100);
        expect(Evaler.memory[3]).to.be.equal(100);
    });

    it("Define multiple variable with no", () => {
        const compiler = new Compiler(
            `
            let myVar, myVar2
            , myVar3, myVar4;
            `, {bufferSize: 100}
        );
        compiler.compile();
        const Evaler = new Interpreter(compiler.ctx.result);
        Evaler.interpret();
        expect(compiler.ctx.lastVariableAddress).to.be.equal(4);
    });

});


