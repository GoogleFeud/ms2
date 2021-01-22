

import {Interpreter, OP_CODES} from "./Interpreter/index";

const Evaler = new Interpreter();

const Test1 = Buffer.from([
    OP_CODES.PUSH_STR, // Operation push string
    0x0, 0x5, // String length (5)
    0x48, 0x65, 0x6c, 0x6c, 0x6f, // The actual string (Hello)
    OP_CODES.PUSH_8, // Operation push 8-bit integer
    0x15, // The number to push (21)
    OP_CODES.ADD, // Add the last two items,
    OP_CODES.PUSH_ARR, 0x0, 0x1, // Wrap the last item in an array
    OP_CODES.END // End the program
]); // Same as: ["Hello" + 21];

const before = Date.now();
Evaler.interpret(Test1);
const after = Date.now();
console.log(`Time it took: ${after - before}`);

console.log("Test 1:", Evaler.stack, "Size: ", Test1.byteLength);

const Test2 = Buffer.from([
    OP_CODES.PUSH_STR,
    0x0, 0xC,
    0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64, 0x21,
    OP_CODES.PUSH_8,
    0x1,
    OP_CODES.ADD,
    OP_CODES.LET,
    0x0, 0x0,
    OP_CODES.END
]); // Same as: let a = "Hello World!" + 1;

const before1 = Date.now();
Evaler.clear();
Evaler.interpret(Test2);
const after1 = Date.now();
console.log(`Time it took: ${after1 - before1}`);

console.log("Test 2:", Evaler.global.entries, "Size: ", Test2.byteLength);

const Test3 = Buffer.from([
    OP_CODES.PUSH_STR, 0x0, 0x5, 
    0x48, 0x65, 0x6c, 0x6c, 0x6f, // Push the string "Hello" to the stack
    OP_CODES.LET, 0x0, 0x1, // Define variable name '1' with value "Hello"
    OP_CODES.PUSH_BOOL, 0x1, OP_CODES.IF_START, // if (false) {
    OP_CODES.PUSH_STR, 0x0, 0xC,
    0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64, 0x21, // Push string "Hello World" to stack
    OP_CODES.PUSH_VAR, 0x0, 0x1,
    OP_CODES.ADD,
    OP_CODES.ASSIGN, 0x0, 0x1,
    OP_CODES.IF_END, // }
    OP_CODES.END
]); 

// Same as:
/**
 * let a = "Hello";
 * if (true) {
 *   a = "Hello World!" + a;
 * }
 */

const before2 = Date.now();
Evaler.clear();
Evaler.interpret(Test3);
const after2 = Date.now();
console.log(`Time it took: ${after2 - before2}`);

console.log("Test 3:", Evaler.global.entries, "Size: ", Test3.byteLength);

const Test4 = Buffer.from([
    OP_CODES.PUSH_STR, 0x0, 0x5, 
    0x48, 0x65, 0x6c, 0x6c, 0x6f, // Push the string "Hello" to the stack
    OP_CODES.LET, 0x0, 0x1, // Define variable name '1' with value "Hello"
    OP_CODES.PUSH_BOOL, 0x1, OP_CODES.IF_START, // if (false) {
    OP_CODES.PUSH_STR, 0x0, 0xC,
    0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64, 0x21, // Push string "Hello World" to stack
    OP_CODES.PUSH_VAR, 0x0, 0x0,
    OP_CODES.ADD,
    OP_CODES.ASSIGN, 0x0, 0x1,
    OP_CODES.PUSH_BOOL, 0x1, OP_CODES.IF_START,
    OP_CODES.PUSH_8, 0x5,
    OP_CODES.PUSH_VAR, 0x0, 0x1,
    OP_CODES.ADD,
    OP_CODES.IF_END,
    OP_CODES.IF_END, // }
    OP_CODES.END
]); 


const before3 = Date.now();
Evaler.clear();
Evaler.global.define(0, "...");
Evaler.interpret(Test4);
const after3 = Date.now();
console.log(`Time it took: ${after3 - before3}`);

console.log("Test 4:", Evaler.global.entries, "Size: ", Test4.byteLength);