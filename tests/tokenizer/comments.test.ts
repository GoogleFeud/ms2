
import { expect } from "chai";
import {Tokenizer} from "../../src/Compiler/Parser/Tokenizer";


describe("Tokenizer comments", () => {

    it("Inline comments", () => {
        const Lexer = new Tokenizer("// This is a comment");
        expect(Lexer.consume()?.value).to.be.equal(undefined);
        expect(Lexer.stream.errors.length).to.be.equal(0);
    });

    it("Multiline comments", () => {
        const Lexer = new Tokenizer(`
        /* This is the number
        50
        */

        50;
        
        `);
        expect(Lexer.consume()?.value).to.be.equal(50);
        expect(Lexer.stream.errors.length).to.be.equal(0);
    });

});