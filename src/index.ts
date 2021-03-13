import {performance} from "perf_hooks";
import {Compiler} from "./Compiler";
import { prettifyError } from "./util";
import {Interpreter} from "./Interpreter";

const evaler = new Compiler({onError: (err, stream) => {
    console.log(prettifyError(err, stream));
}});

const t = performance.now();
const res = evaler.compile(`
5 + 5 + 10;
`, false);
console.log(performance.now() - t);
console.dir(res, {depth: 100});
if (res instanceof Array) console.log(res);
else {
    const interpreter = new Interpreter(res);
    interpreter.interpret();
    console.log(interpreter.stack);
}