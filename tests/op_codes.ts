
import { Interpreter, OP_CODES } from "../src/Interpreter";
import { expect } from "chai";

const Evaler = new Interpreter();

describe("Op Codes", () => {

    describe("PUSH", () => {
        it("PUSH_32", () => {
            const code = Buffer.from([
                OP_CODES.PUSH_32, 0x40, 0x48, 0xf5, 0xc3, 
                OP_CODES.END
            ]);
            Evaler.clear().interpret(code);
            expect(Evaler.stack.pop()).to.be.approximately(3.14, 0.5);
        });
    
        it("PUSH_16", () => {
            const code = Buffer.from([
                OP_CODES.PUSH_16, 0x40, 0x48, 
                OP_CODES.END
            ]);
            Evaler.clear().interpret(code);
            expect(Evaler.stack.pop()).to.be.equal(16456);
        });
    
        it("PUSH_8", () => {
            const code = Buffer.from([
                OP_CODES.PUSH_8, 0x7f, 
                OP_CODES.END
            ]);
            Evaler.clear().interpret(code);
            expect(Evaler.stack.pop()).to.be.equal(127);
        });
    
        it("PUSH_BOOL", () => {
            const code = Buffer.from([
                OP_CODES.PUSH_BOOL, 0x1, 
                OP_CODES.END
            ]);
            Evaler.clear().interpret(code);
            expect(Evaler.stack.pop()).to.be.equal(true);
        });
    
        it("PUSH_STR", () => {
            const code = Buffer.from([
                OP_CODES.PUSH_STR, 0x0, 0xC,
                0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64, 0x21,
                OP_CODES.END
            ]);
            Evaler.clear().interpret(code);
            expect(Evaler.stack.pop()).to.be.equal("Hello world!");
        });
    
        it("PUSH_ARR", () => {
            const code = Buffer.from([
                OP_CODES.PUSH_STR, 0x0, 0xC,
                0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64, 0x21,
                OP_CODES.PUSH_8, 0x45,
                OP_CODES.PUSH_BOOL, 0x0,
                OP_CODES.PUSH_ARR, 0x0, 0x3,
                OP_CODES.END
            ]);
            Evaler.clear().interpret(code);
            const arr = Evaler.stack.pop();
            expect(arr[0]).to.be.equal("Hello world!");
            expect(arr[1]).to.be.equal(69);
            expect(arr[2]).to.be.equal(false);
        });

    });

    describe("ARITHMETIC", () => {
        describe("ADD", () => {
        
            it("21 + 15 = 36", () => {
                const code = Buffer.from([
                    OP_CODES.PUSH_8, 0x15,
                    OP_CODES.PUSH_8, 0xF,
                    OP_CODES.ADD, 
                    OP_CODES.END
                ]);
                Evaler.clear().interpret(code);
                expect(Evaler.stack.pop()).to.be.equal(36);
            });
    
            it("21 + 'Hello world!'", () => {
                const code = Buffer.from([
                    OP_CODES.PUSH_8, 0x15,
                    OP_CODES.PUSH_STR, 0x0, 0xC,
                    0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64, 0x21,
                    OP_CODES.ADD, 
                    OP_CODES.END
                ]);
                Evaler.clear().interpret(code);
                expect(Evaler.stack.pop()).to.be.equal("21Hello world!");
            });
    
        });

        it("SUB", () => {
            const code = Buffer.from([
                OP_CODES.PUSH_8, 0x15,
                OP_CODES.PUSH_8, 0xF,
                OP_CODES.SUB, 
                OP_CODES.END
            ]);
            Evaler.clear().interpret(code);
            expect(Evaler.stack.pop()).to.be.equal(6);
        });
    
        it("MUL", () => {
            const code = Buffer.from([
                OP_CODES.PUSH_8, 0x2,
                OP_CODES.PUSH_8, 0xF,
                OP_CODES.MUL, 
                OP_CODES.END
            ]);
            Evaler.clear().interpret(code);
            expect(Evaler.stack.pop()).to.be.equal(30);
        });
    
        it("DIV", () => {
            const code = Buffer.from([
                OP_CODES.PUSH_8, 0x10,
                OP_CODES.PUSH_8, 0x2,
                OP_CODES.DIV, 
                OP_CODES.END
            ]);
            Evaler.clear().interpret(code);
            expect(Evaler.stack.pop()).to.be.equal(8);
        });
    });

    describe("COMPARISON", () => {

        describe("AND", () => {
            it("undefined && 9", () => {
                Evaler.clear().interpret(Buffer.from([
                    OP_CODES.PUSH_UNDEFINED,
                    OP_CODES.PUSH_8, 0x9,
                    OP_CODES.AND,
                    OP_CODES.END
                ]));
                expect(Evaler.stack.pop()).to.be.equal(undefined);
            });

            it("1 && 3", () => {
                Evaler.clear().interpret(Buffer.from([
                    OP_CODES.PUSH_BOOL, 0x1,
                    OP_CODES.PUSH_8, 0x3,
                    OP_CODES.AND,
                    OP_CODES.END
                ]));
                expect(Evaler.stack.pop()).to.be.equal(3);
            });
        });

        describe("OR", () => {
            it("undefined || 9", () => {
                Evaler.clear().interpret(Buffer.from([
                    OP_CODES.PUSH_UNDEFINED,
                    OP_CODES.PUSH_8, 0x9,
                    OP_CODES.OR,
                    OP_CODES.END
                ]));
                expect(Evaler.stack.pop()).to.be.equal(9);
            });

            it("0 || 0", () => {
                Evaler.clear().interpret(Buffer.from([
                    OP_CODES.PUSH_BOOL, 0x0,
                    OP_CODES.PUSH_8, 0x0,
                    OP_CODES.AND,
                    OP_CODES.END
                ]));
                expect(Evaler.stack.pop()).to.be.equal(false);
            });
        });

        describe("EQUAL", () => {
            it("10 === 10", () => {
                Evaler.clear().interpret(Buffer.from([
                    OP_CODES.PUSH_8, 0x10,
                    OP_CODES.PUSH_8, 0x10,
                    OP_CODES.EQUAL, 
                    OP_CODES.END
                ]));
                expect(Evaler.stack.pop()).to.be.equal(true);
            });

            it("'hello' === 'hallo'", () => {
                Evaler.clear().interpret(Buffer.from([
                    OP_CODES.PUSH_STR, 0x0, 0x5,
                    0x68, 0x65, 0x6c, 0x6c, 0x6f,
                    OP_CODES.PUSH_STR, 0x0, 0x5,
                    0x48, 0x61, 0x6c, 0x6c, 0x6f,
                    OP_CODES.EQUAL, 
                    OP_CODES.END
                ]));
                expect(Evaler.stack.pop()).to.be.equal(false);
            });
        });

        it("NOT", () => {
            const code = Buffer.from([
                OP_CODES.PUSH_8, 0x0,
                OP_CODES.NOT,
                OP_CODES.END 
            ]);
            Evaler.clear().interpret(code);
            expect(Evaler.stack.pop()).to.be.equal(true);
        });

        describe("LESS_THAN", () => {

            it("5 < 1", () => {
                Evaler.clear().interpret(Buffer.from([
                    OP_CODES.PUSH_8, 0x5,
                    OP_CODES.PUSH_8, 0x1,
                    OP_CODES.LESS_THAN,
                    OP_CODES.END
                ]));
                expect(Evaler.stack.pop()).to.be.equal(false);
            });

            it("1 < 8", () => {
                Evaler.clear().interpret(Buffer.from([
                    OP_CODES.PUSH_8, 0x1,
                    OP_CODES.PUSH_8, 0x8,
                    OP_CODES.LESS_THAN,
                    OP_CODES.END
                ]));
                expect(Evaler.stack.pop()).to.be.equal(true);
            });
        });

        describe("LESS_OR_EQUAL", () => {
            it("5 <= 5", () => {
                Evaler.clear().interpret(Buffer.from([
                    OP_CODES.PUSH_8, 0x5,
                    OP_CODES.PUSH_8, 0x5,
                    OP_CODES.LESS_OR_EQUAL,
                    OP_CODES.END
                ]));
                expect(Evaler.stack.pop()).to.be.equal(true);
            });

            it("3 <= 5", () => {
                Evaler.clear().interpret(Buffer.from([
                    OP_CODES.PUSH_8, 0x3,
                    OP_CODES.PUSH_8, 0x5,
                    OP_CODES.LESS_OR_EQUAL,
                    OP_CODES.END
                ]));
                expect(Evaler.stack.pop()).to.be.equal(true);
            });

            it("10 <= 5", () => {
                Evaler.clear().interpret(Buffer.from([
                    OP_CODES.PUSH_8, 0x10,
                    OP_CODES.PUSH_8, 0x5,
                    OP_CODES.LESS_OR_EQUAL,
                    OP_CODES.END
                ]));
                expect(Evaler.stack.pop()).to.be.equal(false);
            });
        });

        describe("GREATER_THAN", () => {
            it("5 > 10", () => {
                Evaler.clear().interpret(Buffer.from([
                    OP_CODES.PUSH_8, 0x5,
                    OP_CODES.PUSH_8, 0x10,
                    OP_CODES.GREATER_THAN,
                    OP_CODES.END
                ]));
                expect(Evaler.stack.pop()).to.be.equal(false);
            });

            it("'hi'.length > 'hello'.length", () => {
                Evaler.clear().interpret(Buffer.from([
                    OP_CODES.PUSH_STR, 0x0, 0x2, 0x68, 0x69,
                    OP_CODES.ACCESS_STR, 0x0, 0x6, 0x6c, 0x65, 0x6e, 0x67, 0x74, 0x68,
                    OP_CODES.PUSH_STR, 0x0, 0x5, 0x68, 0x65, 0x6c, 0x6c, 0x6f,
                    OP_CODES.ACCESS_STR, 0x0, 0x6, 0x6c, 0x65, 0x6e, 0x67, 0x74, 0x68,
                    OP_CODES.GREATER_THAN,
                    OP_CODES.END
                ]));
                expect(Evaler.stack.pop()).to.be.equal(false);
            });
        });

        describe("GREATER_OR_EQUAL", () => {
            it("5 >= 8", () => {
                Evaler.clear().interpret(Buffer.from([
                    OP_CODES.PUSH_8, 0x5,
                    OP_CODES.PUSH_8, 0x8,
                    OP_CODES.GREATER_OR_EQUAL,
                    OP_CODES.END
                ]));
                expect(Evaler.stack.pop()).to.be.equal(false);
            });

            it("[1, 2, 3].length >= 'hii'.length", () => {
                Evaler.clear().interpret(Buffer.from([
                    OP_CODES.PUSH_8, 0x1,
                    OP_CODES.PUSH_8, 0x2,
                    OP_CODES.PUSH_8, 0x3, 
                    OP_CODES.PUSH_ARR, 0x0, 0x3,
                    OP_CODES.ACCESS_STR, 0x0, 0x6, 0x6c, 0x65, 0x6e, 0x67, 0x74, 0x68,
                    OP_CODES.PUSH_STR, 0x0, 0x3, 0x68, 0x69, 0x69,
                    OP_CODES.ACCESS_STR, 0x0, 0x6, 0x6c, 0x65, 0x6e, 0x67, 0x74, 0x68,
                    OP_CODES.GREATER_OR_EQUAL,
                    OP_CODES.END
                ]));
                expect(Evaler.stack.pop()).to.be.equal(true);
            });
        });

    });

    describe("VARIABLES", () => {
        
        it("LET", () => {
            const code = Buffer.from([
                OP_CODES.PUSH_8, 0x5,
                OP_CODES.LET, 0x0, 0x0,
                OP_CODES.END
            ]);
            Evaler.clear().interpret(code);
            expect(Evaler.global.get(0)).to.be.equal(5);
        });

        it("ASSIGN", () => {
            const code = Buffer.from([
                OP_CODES.PUSH_8, 0x5,
                OP_CODES.LET, 0x0, 0x0,
                OP_CODES.PUSH_8, 0x2,
                OP_CODES.MUL,
                OP_CODES.ASSIGN, 0x0, 0x0,
                OP_CODES.END
            ]);
            Evaler.clear().interpret(code);
            expect(Evaler.global.get(0)).to.be.equal(10);
        });

        
        it("PUSH_VAR", () => {
            const code = Buffer.from([
                OP_CODES.PUSH_8, 0x5,
                OP_CODES.LET, 0x0, 0x0,
                OP_CODES.PUSH_8, 0x3,
                OP_CODES.LET, 0x0, 0x1,
                OP_CODES.PUSH_ARR, 0x0, 0x2,
                OP_CODES.LET, 0x0, 0x3,
                OP_CODES.END
            ]);
            Evaler.clear().interpret(code);
            expect(Evaler.global.get(3)).members([5, 3]);
        });

        it("ACCESS", () => {
            const code = Buffer.from([
                OP_CODES.PUSH_8, 0x5,
                OP_CODES.PUSH_8, 0x9,
                OP_CODES.PUSH_BOOL, 0x1,
                OP_CODES.PUSH_ARR, 0x0, 0x3,
                OP_CODES.LET, 0x0, 0x0,
                OP_CODES.ACCESS, 0x0, 0x0,
                OP_CODES.LET, 0x0, 0x1,
                OP_CODES.END
            ]);
            Evaler.clear().interpret(code);
            expect(Evaler.global.get(1)).to.be.equal(5);
        });

    
        it("ACCESS_STR", () => {
            const code = Buffer.from([
                OP_CODES.PUSH_VAR, 0x0, 0x0,
                OP_CODES.ACCESS_STR, 0x0, 0x6,
                0x6c, 0x65, 0x6e, 0x67, 0x74, 0x68,
                OP_CODES.LET, 0x0, 0x1,
                OP_CODES.END
            ]); // Same as: let a = b.length;
            Evaler.clear();
            Evaler.global.define(0, "Thank you world!");
            Evaler.interpret(code);
            expect(Evaler.global.get(1)).to.be.equal(16);
        });

        it("ACCESS_STR (Function)", () => {
            const code = Buffer.from([
                OP_CODES.PUSH_VAR, 0x0, 0x0,
                OP_CODES.ACCESS_STR, 0x0, 0x5,
                0x73, 0x70, 0x6c, 0x69, 0x74,
                OP_CODES.LET, 0x0, 0x1,
                OP_CODES.END
            ]); // Same as: let a = "Thank you world!".split.bind("Thank you world!");
            Evaler.clear();
            Evaler.global.define(0, "Thank you world!");
            Evaler.interpret(code);
            expect(Evaler.global.get(1)(" ")).members(["Thank", "you", "world!"]);
        });

        it("ACCESS_ALIAS (Function)", () => {
            Evaler.clear().global.define(0, "Thank you world!");
            Evaler.interpret(Buffer.from([
                OP_CODES.PUSH_VAR, 0x0, 0x0,
                OP_CODES.ACCESS_ALIAS, 0x23, 
                OP_CODES.LET, 0x0, 0x1,
                OP_CODES.END
            ]));
            expect(Evaler.global.get(1)(" ")).members(["Thank", "you", "world!"]);
        });

    });


    describe("IF", () => {
        it("if...else", () => {
            const code = Buffer.from([
                OP_CODES.PUSH_UNDEFINED, OP_CODES.LET, 0x0, 0x1, // let a;
                OP_CODES.PUSH_VAR, 0x0, 0x0, // Push the variable "0" to the stack
                OP_CODES.JUMP_TRUE, 0x0, 0x5, // If the last pushed value is true, jump 5 bytes ahead
                OP_CODES.PUSH_8, 0x5, OP_CODES.ASSIGN, 0x0, 0x1, // If the variable "0" is false, set a to 5
                OP_CODES.PUSH_8, 0x9, OP_CODES.ASSIGN, 0x0, 0x1, // If the variable "0" is true, set a to 9
                OP_CODES.END
            ]);
            Evaler.clear();
            Evaler.global.define(0, true);
            Evaler.interpret(code);
            expect(Evaler.global.get(1)).to.be.equal(9);
        });
        it("IF...else if...else", () => {
            const code = Buffer.from([
                /**0 */ OP_CODES.PUSH_VAR, 0x0, 0x0, // Push variable 0 to stack
                /**1 */ OP_CODES.PUSH_STR, 0x0, 0x3, 0x79, 0x65, 0x73, // Push string "yes" to stack,
                /**2 */ OP_CODES.EQUAL, // Check if the value in variable 0 is equal to "yes"
                /**3 */ OP_CODES.JUMP_TRUE, 0x0, 0x16, // If they are equal, execute the code on line 12
                /**4 */ OP_CODES.PUSH_VAR, 0x0, 0x0,
                /**5 */ OP_CODES.PUSH_STR, 0x0, 0x2, 0x6e, 0x6f,
                /**6 */ OP_CODES.EQUAL,
                /* 7 */ OP_CODES.JUMP_TRUE, 0x0, 0x5, // if 0 === "no" jump to 10
                /* 8 */ OP_CODES.PUSH_8, 0x3, // if var 0 not equal to "no" or "yes", push 3 to stack
                /* 9 */ OP_CODES.JUMP, 0x0, 0x7,
                /* 10 */ OP_CODES.PUSH_8, 0x2, // if var 0 === "no" push 2 to stack.
                /* 11 */ OP_CODES.JUMP, 0x0, 0x2,
                /**12 */ OP_CODES.PUSH_8, 0x1, // if var 0 === "yes" push 1 to stack.
                OP_CODES.PUSH_8, 0x4,
                OP_CODES.END
            ]);
    
            /**
             * Same as:
             * if (a === "yes") push 1;
             * else if (a === "no") push 2;
             * else push 3;
             * push 4;
             */
            Evaler.clear();
            Evaler.global.define(0, "yes");
            Evaler.interpret(code);
            expect(Evaler.stack).members([1, 4]);
        }); 
    });

    it("EXPORT", () => {
        const code = Buffer.from([
            OP_CODES.PUSH_8, 0x5,
            OP_CODES.EXPORT, 0x0, 0x7, 0x73, 0x6f, 0x6d, 0x65, 0x4e, 0x75, 0x6d,
            OP_CODES.END
        ]);
        Evaler.clear().interpret(code);
        expect(Evaler.exports.someNum).to.be.equal(5);
    });

    describe("FUNCTION", () => {

        it("Simple Function", () => {
            Evaler.clear().interpret(Buffer.from([
                OP_CODES.FN_START, 0x0, 0x2,
                OP_CODES.PUSH_8, 0x5,
                OP_CODES.FN_END,
                OP_CODES.END
            ]));
            const fn = Evaler.stack.pop();
            fn.call();
            expect(Evaler.stack.pop()).is.equal(5);
        });

        it("Variables", () => {
            Evaler.clear().interpret(Buffer.from([
                OP_CODES.LET, 0x0, 0x0,
                OP_CODES.FN_START, 0x0, 0x5,
                OP_CODES.PUSH_8, 0x5,
                OP_CODES.ASSIGN, 0x0, 0x0,
                OP_CODES.FN_END,
                OP_CODES.END
            ]));
            const fn = Evaler.stack.pop();
            fn.call();
            expect(Evaler.global.get(0)).is.equal(5);
        });

    });

    describe("CALL", () => {

        it("Simple Call", () => {
            Evaler.clear().interpret(Buffer.from([
                OP_CODES.LET, 0x0, 0x0,
                OP_CODES.FN_START, 0x0, 0x6,
                OP_CODES.PUSH_8, 0x5,
                OP_CODES.ASSIGN, 0x0, 0x0,
                OP_CODES.RETURN,
                OP_CODES.FN_END,
                OP_CODES.CALL, 0x0, 
                OP_CODES.END
            ]));
            expect(Evaler.stack.pop()).is.equal(5);
        });

        it("Native function call", () => {
            Evaler.clear();
            let res;
            Evaler.global.define(0, (a: any) => res = a);
            Evaler.interpret(Buffer.from([
                OP_CODES.PUSH_VAR, 0x0, 0x0,
                OP_CODES.PUSH_8, 0x2,
                OP_CODES.CALL, 0x1, 
                OP_CODES.END
            ]));

            expect(res).is.equal(2);
        });

        it("Array.push", () => {
            Evaler.clear().interpret(Buffer.from([
                OP_CODES.PUSH_8, 0x2,
                OP_CODES.PUSH_8, 0x5,
                OP_CODES.PUSH_8, 0x6,
                OP_CODES.PUSH_8, 0x8,
                OP_CODES.PUSH_ARR, 0x0, 0x4,
                OP_CODES.LET, 0x0, 0x0,
                OP_CODES.ACCESS_STR, 0x0, 0x4, 0x70, 0x75, 0x73, 0x68,
                OP_CODES.PUSH_8, 0x9,
                OP_CODES.CALL, 0x1, 
                OP_CODES.END
            ]));
            expect(Evaler.global.get(0)).members([2, 5, 6, 8, 9]);
        });
    });

});

