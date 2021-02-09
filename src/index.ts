import {performance} from "perf_hooks";
import {Parser} from "./Compiler/Parser";

const t = performance.now();
const parser = new Parser(`
meta a = 50 + 1;
`, {prettyPrint: true});

const res = parser.parse();
console.log(performance.now() - t);
console.dir(res, {depth: 5});
console.log(parser.meta);
if (parser.tokens.stream.errors.length) {
    for (const error of parser.tokens.stream.errors) {
        console.log(error);
    }
}
