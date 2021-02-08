import {performance} from "perf_hooks";
import {Parser} from "./Compiler/Parser";

const t = performance.now();
const parser = new Parser(`
meta name "This is a meta tag";
meta name1 true;
meta name2 3.14;
meta name3 false;
meta name4 null;
let a, b, c, d, = 5 + (1 + 6)
const e = !"Hello!";
`);

const res = parser.parse();
console.log(performance.now() - t);
console.dir(res, {depth: 5});
console.log(parser.meta);
console.log(parser.tokens.stream.errors);