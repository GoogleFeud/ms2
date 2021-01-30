import {performance} from "perf_hooks";

import { Interpreter, OP_CODES } from "./Interpreter";
import {CompilerContext} from "./Compiler/Context";

function doSomething() {
    console.log("CALL!");
}

const t2 = performance.now();

for (let i=0; i < 10; i++) {
    if (i == 9) {
        doSomething();
    }
}

const res2 = performance.now();

console.log(`JS: ${res2 - t2} ms`);

const Evaler = new Interpreter();

const ctx = new CompilerContext({bufferSize: 1024});
Evaler.clear();
Evaler.global.define(() => {
    console.log("CALL!");
}); 
ctx.addNumber(0, true); ctx.addOpCode(OP_CODES.LET); // let i = 0; The value of i (0) still stays in the stack
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
Evaler.interpret(ctx.result);
const res = performance.now();
console.log(`MS2: ${res - t} ms`);

