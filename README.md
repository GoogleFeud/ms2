
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

**No object literals**

