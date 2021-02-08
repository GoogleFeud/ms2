
import {Parser} from "./Compiler/Parser";

const parser = new Parser(`
// This is a comment
1 + 4;
`);

console.log(parser.parse());