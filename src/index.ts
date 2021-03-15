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
1 + 55 / 10 * 10 / 5 + 55 / 5
`, false);
console.log("Compilation: ", performance.now() - t);
console.dir(res, {depth: 100});
if (res instanceof Array) console.log(res);
else {
    const interpreter = new Interpreter(res);
    const b = performance.now();
    interpreter.interpret();
    console.log("Interpretation: ", performance.now() - b);
    console.log(interpreter.stack, evaler.ctx.variableTypings);
}