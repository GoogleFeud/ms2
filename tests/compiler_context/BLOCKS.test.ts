

import {performance} from "perf_hooks";

import { Interpreter, OP_CODES } from "../../src/Interpreter";
import {CompilerContext} from "../../src/Compiler/Context";
import { expect } from "chai";

describe("COMPILER CONTEXT BLOCKS", () => {

    it("One block", () => {
        const ctx = new CompilerContext({bufferSize: 1024});
        ctx.addUnsigned16(0);
        ctx.enterBlock();
        ctx.addNumber(10, true); // 2 bytes
        ctx.addNumber(4.5, true); // 5 bytes
        ctx.addOpCode(OP_CODES.ADD); // 1 byte
        const blockSize = ctx.exitBlock();
        ctx.addOpCode(OP_CODES.END);
        expect(blockSize).to.be.equal(8);
        const Evaler = new Interpreter(ctx.result);
        Evaler.interpret();
        expect(Evaler.stack.pop()).to.be.approximately(14.5, 3);
    });

    it("Double block", () => {
        const ctx = new CompilerContext({bufferSize: 1024});
        const Evaler = new Interpreter(ctx.result);
        Evaler.addGlobal(() => {
            expect(true).to.be.equal(true);
        });
        /** Let's say we are the parsing the following:
         * for (let i=0; i < 10; i++) {
         *   if (i == 9) {
         *    doSomething();
         *  }
         * }
         */
        
        ctx.addUnsigned16(2);
        ctx.addNumber(0, true); ctx.addOpCode(OP_CODES.LET); // let i = 0; The value of i (1) still stays in the stack
        ctx.addNumber(10, true); ctx.addOpCode(OP_CODES.LESS_THAN); // lastPushedValue < 10
        ctx.addOpCode(OP_CODES.JUMP_FALSE);
        const jumpFalseOffset = ctx.skip(2);
        ctx.enterBlock();
        ctx.addOpCode(OP_CODES.PUSH_VAR); ctx.addUnsigned16(1);
        ctx.addNumber(9, true); ctx.addOpCode(OP_CODES.EQUAL);
        ctx.addOpCode(OP_CODES.JUMP_FALSE);
        const ifStatementJumpOffset = ctx.skip(2);
        ctx.enterBlock();
        ctx.addOpCode(OP_CODES.PUSH_VAR); ctx.addUnsigned16(0);
        ctx.addOpCode(OP_CODES.CALL); ctx.addUnsigned8(0);
        ctx.result.writeUInt16BE(ctx.exitBlock(), ifStatementJumpOffset);
        ctx.addOpCode(OP_CODES.INC); ctx.addUnsigned16(1); // increment 1
        ctx.addOpCode(OP_CODES.GOTO);
        const gotoOffset = ctx.skip(2);
        const jumpFalseSize = ctx.exitBlock();
        ctx.result.writeUInt16BE(jumpFalseSize, jumpFalseOffset);
        ctx.result.writeUInt16BE(ctx.offset - jumpFalseSize - 6, gotoOffset);
        ctx.addOpCode(OP_CODES.END);
        const t = performance.now();
        Evaler.interpret();
        console.log(`Test took: ${performance.now() - t} ms`);
    });
});

