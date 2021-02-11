import {performance} from "perf_hooks";
import {Parser} from "./Compiler/Parser";
import { prettifyError } from "./util";

const t = performance.now();
const parser = new Parser(`
//const something = ((a, b) => a + b + c / 2).a.b().c[d.e];
const a = b();
`, {onError: (err, stream) => {
    console.log(prettifyError(err, stream));
}});

const res = parser.parse();
console.log(performance.now() - t);
console.dir(res, {depth: 5});
console.log(parser.meta);
