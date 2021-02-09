import {performance} from "perf_hooks";
import {Parser} from "./Compiler/Parser";
import { prettifyError } from "./util";

const t = performance.now();
const parser = new Parser(`
meta a = 50;
const something = 100;
`, {onError: (err, stream) => {
    console.log(prettifyError(err, stream));
}});

const res = parser.parse();
console.log(performance.now() - t);
console.dir(res, {depth: 5});
console.log(parser.meta);
