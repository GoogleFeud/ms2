import {performance} from "perf_hooks";
import {Parser} from "./Compiler/Parser";
import { prettifyError } from "./util";

const t = performance.now();
const parser = new Parser(`
const i = if (a) (if (b) 3) else 2;
`, {onError: (err, stream) => {
    console.log(prettifyError(err, stream));
}});

const res = parser.parse();
console.log(performance.now() - t);
console.dir(res, {depth: 7});
console.log(parser.meta);
