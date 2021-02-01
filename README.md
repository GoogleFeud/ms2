
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

Check out the [wiki](https://github.com/GoogleFeud/ms2/wiki) for more information!