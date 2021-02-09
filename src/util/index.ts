
import { InputStream, MSError } from "../Compiler/Parser/InputStream";
import {PropertyAlias} from "./default_property_alias";


const _typeToString: Record<number, string> = {
    0: "SyntaxError",
    1: "TypeError",
    2: "ReferenceError"
};

export function addPropertyAlias(...str: Array<string>) : Array<number> {
    let currentLength = Object.values(PropertyAlias).length;
    const results = [];
    for (const item of str) {
        PropertyAlias[++currentLength] = item;
        results.push(currentLength);
    }
    return results;
}

export function prettifyError(err: MSError, stream: InputStream) : string {
    let col = "";
    for (let i=0; i < err.col - 1; i++) col += " ";
    col += "^";
    return `${stream.code.split("\n")[err.line - 1]}\n\n${col}\n${_typeToString[err.type]}: ${err.message} (line ${err.line}, col ${err.col})`;
}

