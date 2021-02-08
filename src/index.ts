
import {Parser} from "./Compiler/Parser";

const parser = new Parser(`
// This is a comment
let a, b, c, d, = 5 + (1 + 6)
const e = "Hello!"
`);

console.dir(parser.parse(), {depth: 5});