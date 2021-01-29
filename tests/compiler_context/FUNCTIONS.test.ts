
import { Interpreter, OP_CODES } from "../../src/Interpreter";
import {CompilerContext} from "../../src/Compiler/Context";
import { expect } from "chai";

const Evaler = new Interpreter();

describe("COMPILER CONTEXT FUNCTIONS", () => {

    it("Regular function", () => {
        const ctx = new CompilerContext({bufferSize: 1024});
        ctx.addOpCode(OP_CODES.FN_START);
        const functionSizeOffset = ctx.skip(2);
        ctx.enterBlock();
        ctx.addOpCode(OP_CODES.PUSH_VAR);
        ctx.addUnsigned16(0);
        ctx.addOpCode(OP_CODES.PUSH_VAR);
        ctx.addUnsigned16(1);
        ctx.addOpCode(OP_CODES.ADD);
        ctx.addOpCode(OP_CODES.RETURN);
        const fnSize = ctx.exitBlock();
        ctx.result.writeUInt16BE(fnSize, functionSizeOffset);
        ctx.addOpCode(OP_CODES.FN_END);
        ctx.addOpCode(OP_CODES.END);
        Evaler.clear().interpret(ctx.result);
        expect(Evaler.stack.pop().call(undefined, 1, 5)).to.be.equal(6);
    });
    
});

