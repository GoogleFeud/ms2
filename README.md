
# MS2
**A programming language written in javascript, aiming to be as fast as javascript.**

MS2 is a interpreted programming language written in javascript. MS2 is designed to be an easy solution for configuring a service, or changing the way an application behaves. It's made for executing user-provided ( unsafe) code.

- The MS2 compiler compiles the program to MS2 bytecode, which can be intrepreted by the interpreter anytime.
- That means you have to compile the code once, and from there you can only use the bytecode. The bytecode can be also stored in a database.
- The MS2 language is very similar to javascript, but it has (hidden) type safety, which makes the bytecode more reliable, and less likely to error.
- Import any javascript object (the compiler needs to know about the imports beforehand, though)
- Call exported MS2 functions directly from javascript
- Set memory limit
- 100% safe. Automatically detects harmful code and lets you know. 

# Table of contents

- Compiler bytecode
    - [Number Operations](https://github.com/GoogleFeud/ms2#math--numbers)
    - [Booleans](https://github.com/GoogleFeud/ms2#booleans)
    - [Strings](https://github.com/GoogleFeud/ms2#strings)
    - [Arrays](https://github.com/GoogleFeud/ms2#array-literals)
    - [Objects](https://github.com/GoogleFeud/ms2#object-literals)
    - [Variables](https://github.com/GoogleFeud/ms2#variables)
    - [Property Access](https://github.com/GoogleFeud/ms2#property-access)
    - [Functions](https://github.com/GoogleFeud/ms2#functions)
    - [Call](https://github.com/GoogleFeud/ms2#calling)
    - [Exporting](https://github.com/GoogleFeud/ms2#exporting)
    - Logic
        - [Or](https://github.com/GoogleFeud/ms2#or)
        - [And](https://github.com/GoogleFeud/ms2#and)
        - [Comparisons](https://github.com/GoogleFeud/ms2#logic-comparisons)
        - [Not](https://github.com/GoogleFeud/ms2#not)
        - [If](https://github.com/GoogleFeud/ms2#if)
        - [If-Else-If-Else](https://github.com/GoogleFeud/ms2#if---else-if---else)
    - [Loops](https://github.com/GoogleFeud/ms2#loops)

## Compiler to bytecode

### Math / numbers

```1 + 1```

```
PUSH_8 0x1
PUSH_8 0x1
ADD
```

_________________________________

```1 + 10 / 2```

```
PUSH_8 0xA // push 10 to stack
PUSH_8 0x2 // divide 10 by 2
DIV
PUSH_8 0x0 0x0 0x0 0x1
ADD
```

__________________________________

**Other OP codes related to numbers:** `PUSH_32`, `PUSH_16`, `MUL`, `SUB`

### Booleans

```true```

```
PUSH_BOOL 0x1
```

_________________________________


### Strings

```"Hello World"```

```
PUSH_STR 0x0 0xB 48 65 6c 6c 6f 20 57 6f 72 6c 64
```

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

### Variables

All variables (including function params) get stored in an array. There can be max **65,535** variables. There is **no** garbage collector, which means all the variables stored in the array stay until the array gets garbage collected, or gets cleared (via `arr.length = 0`). Here an index of a variable is called an **address**. 

**The first two bytes of the bytecode tell the interpreter how much space to make for variables.**

```
let a = 5;
```

```
PUSH_8 0x5
ASSIGN 0x0 0x1 // Assign value 5 to address "0x0 0x1"
```


### Property access

#### Objects created from MS

**Objects created in MS2 will have indexes as properties.**

```a->b;```

```
PUSH_VAL 0x0 0x1 // Push value of variable name to the stack
ACCESS 0x 0x1 // Get the property b and push it to the stack
```

#### Native objects (arrays, strings, maps, etc.)

Most native object properties are mapped to an index, which means the interpreter is going to access them faster, and they are going to use less space.

```a->length;```

```
PUSH_VAL 0x0 0x1 // Push a to stack
ACCESS_ALIAS 0x0 // "length"'s index is 0
```

#### Custom objects

There are two ways to access properties of custom objects:

**ACCESS_STR**

"smth" gets converted to hex, with the first 2 bytes being it's length

```
a->smth;
```

```
PUSH_VAL 0x0 0x1 // Push a to stack
ACCESS_STR 0x0 0x4 ...
```

**CUSTOM MAPPINGS**

You can also add custom mappings, so that custom properties get shortened.

```
addPropertyAlias("smth");
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
LET
PUSH_8 0x2
LET
FN_START 0x0 0xC // Starts the function, specifies the length of the function
PUSH_VAR 0x0 0x3
PUSH_VAR 0x0 0x4
ADD // a + b
PUSH_VAR 0x0 0x0
ADD // a + b + something
PUSH_8 0x1
ADD // a + b + something + 1
FN_END // Ends the function, all variables (including params get deleted)
LET 0x0 0x5 // Assigns the third element to the function
```

#### Inner functions

Let's assume that the following function is inside a function which is defined globally:

```
let fn2 = (a, b) => {
    return a / b;
}
```

```
FN_START_INNER 0x0 0x6 0x0 // The first two bytes are the length of the function, the third is the ID of the inner function. 
PUSH_VAR 0x0 0x0
PUSH_VAR 0x0 0x1
DIV
RETURN
FN_END_INNER 0x0
```

### Calling

```
myFn(5, 10);
```

```
PUSH_VAR 0x0 0x3
PUSH_8 0x5
PUSH_8 0xA
CALL 0x2 // Executes the function with 2 arguments
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

### Loops

```
let arr = [];
for (let i=0; i < 10; i++) {
arr.push(i);
};
```

```
PUSH_ARR 0x0 0x0
LET // let arr = [];
PUSH_8 0x0
LET // let i = 0;
PUSH_8 0xA // 10
LESS_THAN, // i < 10
JUMP_FALSE 0x0 0x10 // If i < 10 equals false, skip the entire loop sequence
PUSH_VAR 0x0 0x0 // Get the array []
ACCESS_ALIAS 0x1 // Get the push function
PUSH_VAR 0x0 0x1, // Get i
CALL_POP 0x1 // Call push with argument i, the "POP" means that the result of the function won't be pushed to the stack
INC 0x0 0x1 // i++
OP_CODES.GOTO 0x0 0xB // Go back to the beginning of the loop 
 ```