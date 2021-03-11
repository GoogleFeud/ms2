
import { expect } from "chai";
import {Tokenizer} from "../../src/Compiler/Parser/Tokenizer";


describe("Tokenizer numbers", () => {

    it("Integers", () => {
        const Lexer = new Tokenizer("50");
        expect(Lexer.consume()?.value).to.be.equal(50);
        expect(Lexer.stream.errors.length).to.be.equal(0);
    });

    it("Floating points", () => {
        const Lexer = new Tokenizer("3.14");
        expect(Lexer.consume()?.value).to.be.approximately(3.14, 3);
        expect(Lexer.stream.errors.length).to.be.equal(0);
    });

    it("Numeric separators", () => {
        const Lexer = new Tokenizer("300_000");
        expect(Lexer.consume()?.value).to.be.equal(300_000);
        expect(Lexer.stream.errors.length).to.be.equal(0);
    });

    it("Numeric separators & floating points", () => {
        const Lexer = new Tokenizer("3.300_640");
        expect(Lexer.consume()?.value).to.be.approximately(3.300_640, 6);
        expect(Lexer.stream.errors.length).to.be.equal(0);
    });

});