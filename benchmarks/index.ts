
// You need to npm i "sval" for this to work

import Sval from "sval";
import {performance} from "perf_hooks";
import { Interpreter, OP_CODES } from "../src/Interpreter";
//@/ts-expect-error For testing only
const sval = new Sval();

/** First benchmark - a simple for loop which pushes to an array */
console.log("For loop:\n");
(() => {
    
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
        OP_CODES.PUSH_VAR, 0x0, 0x0,
        OP_CODES.EXPORT, 0x0, 0x3, 0x72, 0x65, 0x73 
    ]));


    const time2 = performance.now();
    Evaler.interpret();

    console.log(`MS2 (${Evaler.exports.res}): `, performance.now() - time2);


    const svalAST = sval.parse(`
const arr = [];
for (let i=0; i < 10; i++) {
    arr.push(i);
}
exports.res = arr;
`);

    const time3 = performance.now();
    sval.run(svalAST);
    console.log(`Sval (${sval.exports.res}): `, performance.now() - time3);


    const time4 = performance.now();
    const res1 = eval(`
const arr = [];
for (let i=0; i < 10; i++) {
    arr.push(i);
}
arr;
`);
    console.log(`Javascript Eval (${res1}): `, performance.now() - time4);
})();

console.log("\n\n");

// Second benchmark, create a function and call it
console.log("Function creation + call\n");
(() => {

    const Evaler = new Interpreter(Buffer.from([
        0x0, 0x0,
        OP_CODES.FN, 0x0, 0x9,
        OP_CODES.PUSH_ARG, 0x0,
        OP_CODES.PUSH_ARG, 0x1,
        OP_CODES.ADD,
        OP_CODES.PUSH_ARG, 0x2,
        OP_CODES.ADD,
        OP_CODES.RETURN,
        OP_CODES.LET, // Offset 0

        OP_CODES.PUSH_8, 0x1,
        OP_CODES.PUSH_8, 0x5,
        OP_CODES.PUSH_8, 0x9,
        OP_CODES.CALL, 0x3,
        OP_CODES.EXPORT, 0x0, 0x3, 0x72, 0x65, 0x73
    ]));

    const time2 = performance.now();
    Evaler.interpret();

    console.log(`MS2 (${Evaler.exports.res}): `, performance.now() - time2);

    const svalAST = sval.parse(`
const func = (a, b, c) => a + b + c;
exports.res = func(1, 5, 9);
`);

    const time3 = performance.now();
    sval.run(svalAST);
    console.log(`Sval (${sval.exports.res}): `, performance.now() - time3);

    const time4 = performance.now();
    const res1 = eval(`
const func = (a, b, c) => a + b + c;
func(1, 5, 9);
`);
    console.log(`Javascript Eval (${res1}): `, performance.now() - time4);
})();

console.log("\n\n");

// Third benchmark, If else statements
(() => {
    console.log("Accessing properties:\n\n");

    const Evaler = new Interpreter(Buffer.from([
        0x0, 0x1,
        OP_CODES.PUSH_8, 0x1,
        OP_CODES.PUSH_8, 0x2,
        OP_CODES.PUSH_8, 0x3,
        OP_CODES.PUSH_ARR, 0x0, 0x3,
        OP_CODES.LET, // let obj = ...; 0
        OP_CODES.ACCESS, 0x0, 0x0,
        OP_CODES.PUSH_VAR, 0x0, 0x0,
        OP_CODES.ACCESS, 0x0, 0x1,
        OP_CODES.ADD, 
        OP_CODES.PUSH_VAR, 0x0, 0x0,
        OP_CODES.ACCESS, 0x0, 0x2,
        OP_CODES.ADD,
        OP_CODES.EXPORT, 0x0, 0x3, 0x72, 0x65, 0x73
    ]));

    const time2 = performance.now();
    Evaler.interpret();

    console.log(`MS2 (${Evaler.exports.res}): `, performance.now() - time2);

    const svalAST = sval.parse(`
    const obj = { a: 1, b: 2, c: 3};
    exports.res = obj.a + obj.b + obj.c;
`);

    const time3 = performance.now();
    sval.run(svalAST);
    console.log(`Sval (${sval.exports.res}): `, performance.now() - time3);

    const time4 = performance.now();
    const res1 = eval(`
    const obj = { a: 1, b: 2, c: 3};
obj.a + obj.b + obj.c;
`);
    console.log(`Javascript Eval (${res1}): `, performance.now() - time4);
})();

console.log("\n\n");

// Fourth benchmark, adding numbers to map
(() => {
    console.log("Adding entries to map:\n\n");

    const Evaler = new Interpreter(Buffer.from([
        0x0, 0x1,
        OP_CODES.PUSH_VAR, 0x0, 0x0,
        OP_CODES.ACCESS_ALIAS, 0x15,
        OP_CODES.PUSH_STR, 0x0, 0x1, 0x41,
        OP_CODES.PUSH_8, 0x1,
        OP_CODES.CALL_POP, 0x2,
        OP_CODES.PUSH_VAR, 0x0, 0x0,
        OP_CODES.ACCESS_ALIAS, 0x15,
        OP_CODES.PUSH_STR, 0x0, 0x1, 0x42,
        OP_CODES.PUSH_8, 0x2,
        OP_CODES.CALL_POP, 0x2,
        OP_CODES.PUSH_VAR, 0x0, 0x0,
        OP_CODES.ACCESS_ALIAS, 0x15,
        OP_CODES.PUSH_STR, 0x0, 0x1, 0x43,
        OP_CODES.PUSH_8, 0x3,
        OP_CODES.CALL_POP, 0x2
    ]));

    Evaler.addGlobal(new Map());
    const time2 = performance.now();
    Evaler.interpret();

    console.log(`MS2 (${[...Evaler.memory[0].values()]}): `, performance.now() - time2);

    const svalAST = sval.parse(`
    map.set("A", 1);
    map.set("B", 2);
    map.set("C", 3);
`);
    const map2 = new Map();
    sval.import("map", map2);
    const time3 = performance.now();
    sval.run(svalAST);
    console.log(`Sval (${[...map2.values()]}): `, performance.now() - time3);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const map1 = new Map();
    const time4 = performance.now();
    eval(`
    map1.set("A", 1);
    map1.set("B", 2);
    map1.set("C", 3);
`);
    console.log(`Javascript Eval (${[...map1.values()]}): `, performance.now() - time4);
})();