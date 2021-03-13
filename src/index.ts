import {performance} from "perf_hooks";
import {Compiler} from "./Compiler";
import { prettifyError } from "./util";
import {Interpreter} from "./Interpreter";
import { MSError } from "./util/ErrorCollector";

const evaler = new Compiler();

evaler.errors.on("error", (err: MSError) => {
    console.log(prettifyError(err, evaler.parser.tokens.stream));
});

const t = performance.now();
const res = evaler.compile(`
let a = true;
const b = a + 5;
`, false);
console.log(performance.now() - t);
console.dir(res, {depth: 100});
if (res instanceof Array) console.log(res);
else {
    const interpreter = new Interpreter(res);
    interpreter.interpret();
    console.log(interpreter.stack);
}