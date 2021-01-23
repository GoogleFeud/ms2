
Programming language to create and extend mafia roles. Translates source code to bytecode which can be easily stored in a database for faster execution.

# Table of contents

...

## Programming language / byte code translation

### Math / numbers

```1 + 1```

```
PUSH_32 0x0 0x0 0x0 0x1
ADD_32 0x0 0x0 0x0 0x1
```

_________________________________

```1 + 10 / 2```

```
PUSH_32 0x0 0x0 0x0 0xA // push 10 to stack
DIV_32 0x0 0x0 0x0 0x2 // divide 10 by 2
ADD_32 0x0 0x0 0x0 0x1 // add 1 to 5
```

__________________________________

**Other OP codes related to numbers:** `PUSH_8`, `PUSH_16`, `ADD_8`, `ADD_16`, `DIV_8`, `DIV_16`, `MUL_X`, `SUB_X`

### Booleans

```true```

```
PUSH_8 0x1
```

_________________________________


### Strings

```"Hello World"```

```
PUSH_STR 0x0 0xB 48 65 6c 6c 6f 20 57 6f 72 6c 64
```

Adds the string "Hello World" to the string pool and pushes a unique string id to the stack that represents the string literal (and all matching string literals)

### Array literals

```[1, 2, 3, 4, 5]```

```
PUSH_8 0x1
PUSH_8 0x2
PUSH_8 0x3
PUSH_8 0x4
PUSH_8 0x5
PUSH_ARR 0x0 0x5
```

Adds the array to the array literal pool and pushes a unique id to the stack that represents the raw array structure

### Object literals

```{a: 1, b: 2, c: 3}```

Objects can be represented in two ways: `space-efficient` and `ease-of-access`. 

**space-efficient**:

```
PUSH_8 0x1
PUSH_8 0x2
PUSH_8 0x3
PUSH_ARR 0x0 0x3
```

The compiler completely ignores property names, and turns objects into arrays. Property access is compiled to this:

```
let obj = {a: 1, b: 2};
obj->a;
```

```
PUSH_8 0x1
PUSH_8 0x2
PUSH_ARR 0x0 0x2
ACCESS 0x0 0x0 // Pushes 1 to the stack
```

**ease-of-access**:
This method is usually used only for objects which get imported directly from javascript. If you want to import objects from javascript, and you want it to be as clean as possible, enable this option.

```
obj->someProp;
```

```
PUSH_8 0xx 0xx // Push address of the obj variable
ACCESS_STR 0x0 0x8 73 6f 6d 65 50 72 6f 70 // Push value inside "someProp" to the stack
```

Without enabling the `ease-of-access` option, this is how you would import objects:

```js
globals: {
    obj: Context.importObject([["prop", 1]]); // {prop: 1} essentially  
}
```

### Variables

**LET, PUSH_VAR, and ASSIGN statements only accept unsigned integers**

```let pi = 3.14;```

```
PUSH_32 40 48 f5 c3 // Push 3.14 to the stack
LET 0x0 0x1 // Define variable 
```

**The LET statement doesn't pop the last element in the stack**

Variable names are translated from strings to a unsigned 16-bit number. The variable value is pushed to the stack beforehand. That means that there are **65535** possible variables. Variable names are incremented, so the first declared variable will have the name `0`, then `1`, and so on.

That makes importing global variables a lot harder, that's why you should compile the code and run the code with the **same set of global variables**:

```js
const Compiler = require("ms2");

const bytecode = Compiler.toBuffer(`print(var1);`, {
    globals: ["var1", "print"]; // The compiler needs to know IN ADVANCE, what the global variables are and what are their indexes (var1's index is 0)
});

Compiler.eval(bytecode, {
    globals: {
        var1: 3.14,
        print: console.log
    } // When evaluating, you need to specify the globals again, but this time with their actual values. The order needs to remain the same.
});
```

### Property access

```a->b;```

```
PUSH_VAL 0x0 0x1 // Push value of variable name to the stack
ACCESS 0x 0x1 // Get the property b and push it to the stack
```

### Functions

```
let something = 1;
let something2 = 2;
let myFn = |a, b| => {
    return a + b + something + 1;
};
```

```
PUSH_8 0x1
LET 0x0 0x0
PUSH_8 0x2
LET 0x0 0x1
FN_START // Creates a new enviourment, which contains a and b at addresses 0x3 and 0x4
ADD // adds the last two pushed values
ADD_VAR 0x0 0x0 // adds the "something" variable with the last pushed value
ADD_8 0x1 // adds the last pushed variable with 1
RTRN // Returns the last pushed value 
FN_END // Ends the function
LET 0x0 0x3 // Assigns the third element to the function
```

### Calling

```
myFn(5, 10);
```

```
PUSH_8 0x5
PUSH_8 0xA
CALL 0x0 0x3 // Executes the bytecode 
```

### Exporting

The export keyword can only be used on the top level.

```
export exportName = 10;
```

```
PUSH_8 0xA // push 10 to the stack
EXPORT 0x0 0x10 ... // export 10 with the name specified
```

### Or 

```
let a = myFn(0, 0) || 1;
```

```
PUSH_8 0x0 0x0
PUSH_8 0x0 0x0
CALL 0x0 0x3
PUSH_8 0x1
OR // Get the last two pushed values, if the first one is falsey, replace it with the second one
LET 0x0 0x4
```

### And

```
let b = myFn(0, 0) && 1;
```

```
PUSH_8 0x0 0x0
PUSH_8 0x0 0x0
CALL 0x0 0x3
PUSH_8 0x1
AND // Get the last two pushed values, if both are truthy, push the second one, otherwise, replace with false
LET 0x0 0x5
```

### Logic comparisons

```b == true```

```
PUSH_VAR 0x0 0x5
PUSH_8 0x1 
EQUAL // Pushes true or false
```

**It's the same with the others: >, >, >=, <=**

### Not

```!b```

```
PUSH_VAR 0x0 0x5
NOT // Pushes the result to the stack
```

### If

**JUMP statements only accept unsigned integers**

```
if (b == true) {
    print("Hello World");
}
print("You got that message, right?");
```

```
PUSH_VAR 0x0 0x5
JUMP_FALSE 0x0, 0x...
PUSH_STR ...
CALL ...
PUSH_STR ...  // <-- JUMP_FALSE will jump to here if b == true returns false
CALL ...
```

### If - else if - else

```
if (a === "yes") {
    return 1;
}
else if (a === "no") {
    return 2;
} else return 3;
```

```
1. PUSH_VAR ...
2. PUSH_STR ...
3. EQUAL
4. JUMP_TRUE 14
5. PUSH_VAR ...
6. PUSH_STR ...
7. EQUAL
8. JUMP_TRUE 11
9. PUSH_8 0x3
10. JUMP 15
11. PUSH_8 0x2
12. JUMP 15
14. PUSH_8 0x1
15. ...
```

