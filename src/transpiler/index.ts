
import * as Esprima from "esprima";
import Walkers from "./walkers";

export const defaultEsprimaSettings: Esprima.ParseOptions = {
    range: false,
    loc: true,
    comment: false,
    tolerant: false,
    jsx: false
}

export type Walker = (el: any, ctx: string, transpiler: MS2Transpiler) => void;
export type WalkerCollection = Record<string, Walker>;

export interface MS2TranspilerSettings {
    imports?: Record<string, string>,
    exports?: Record<string, string>,
    allowLoops?: boolean,
    maxMemory?: number
}

export class MS2Transpiler {
    settings: MS2TranspilerSettings
    constructor(options: MS2TranspilerSettings = {}) {
        this.settings = options;
    } 

    transpile(code: string, exprimaSettings: Esprima.ParseOptions = defaultEsprimaSettings) : string|undefined {
        let tree;
        try {
            tree = this.settings.exports ? Esprima.parseModule(code, exprimaSettings):Esprima.parseScript(code, exprimaSettings);
        }catch(err) {
            return err;
        }
        for (const element of tree.body) {
            Walkers[element.type](element, "", this);
        }
        return "";
    }


}