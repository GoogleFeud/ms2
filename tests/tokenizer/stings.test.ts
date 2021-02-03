/* eslint-disable quotes */


import { expect } from "chai";
import {Tokenizer} from "../../src/Compiler/Parser/Tokenizer";


describe("Tokenizer strings", () => {

    it("Simple strings", () => {
        const Lexer = new Tokenizer('"Hello World!"');
        expect(Lexer.consume()?.value).to.be.equal("Hello World!");
        expect(Lexer.stream.errors.length).to.be.equal(0);
    });

    it("Escaped characters", () => {
        const Lexer = new Tokenizer('"' + '\\"' + "Hello World" + '"');
        expect(Lexer.consume()?.value).to.be.equal("\"Hello World");
        expect(Lexer.stream.errors.length).to.be.equal(0);
    });

    it("Multiline strings", () => {
        const Lexer = new Tokenizer(`
"Hello

World"
        `);
        expect(Lexer.consume()?.value).to.be.equal("Hello\n\nWorld");
        expect(Lexer.stream.errors.length).to.be.equal(0);
    });

});