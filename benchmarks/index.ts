
// You need to npm i "sval" for this to work

import {performance} from "perf_hooks";
import { Interpreter, OP_CODES } from "../src/Interpreter";
//@ts-expect-error For testing only
import Sval from "sval";

const sval = new Sval();

const time1 = performance.now();

const arr = [];
for (let i=0; i < 10; i++) {
    arr.push(i);
}

console.log("(JS) For loop:", performance.now() - time1);

const Evaler = new Interpreter(Buffer.from([
    0x0, 0x2,
    OP_CODES.PUSH_ARR, 0x0, 0x0, OP_CODES.LET, // let arr = [];
    OP_CODES.PUSH_8, 0x0, OP_CODES.LET, // let i = 0;
    OP_CODES.PUSH_8, 0xA, // 10
    OP_CODES.LESS_THAN, // i < 10
    OP_CODES.JUMP_FALSE, 0x0, 0x10,
    OP_CODES.PUSH_VAR, 0x0, 0x0,
    OP_CODES.ACCESS_ALIAS, 0x1,
    OP_CODES.PUSH_VAR, 0x0, 0x1,
    OP_CODES.CALL_POP, 0x1,
    OP_CODES.INC, 0x0, 0x1,
    OP_CODES.GOTO, 0x0, 0x9,
    OP_CODES.END
]));

const time2 = performance.now();
Evaler.interpret();
Evaler.clear();

console.log("(MS) For loop:", performance.now() - time2);


const svalAST = sval.parse(`
const arr = [];
for (let i=0; i < 10; i++) {
    arr.push(i);
}
`);

const time3 = performance.now();
sval.run(svalAST);
console.log("(SVAL) For loop:", performance.now() - time3);


const time4 = performance.now();
eval(`
const arr = [];
for (let i=0; i < 10; i++) {
    arr.push(i);
}
`);
console.log("(JS - Eval) For loop:", performance.now() - time4);