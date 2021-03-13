
import {Typing, TypingResolvable, UNKNOWN, STRING, NUMBER, NULL, BOOLEAN, ARRAY, DEFAULT_TYPING_IDS} from "./types";

export class TypeChecker {
    types: Record<string|number, Typing>
    constructor() {
        this.types = {
            [DEFAULT_TYPING_IDS.UNKNOWN]: UNKNOWN,
            [DEFAULT_TYPING_IDS.STRING]: STRING,
            [DEFAULT_TYPING_IDS.NULL]: NULL,
            [DEFAULT_TYPING_IDS.BOOLEAN]: BOOLEAN,
            [DEFAULT_TYPING_IDS.ARRAY]: ARRAY,
            [DEFAULT_TYPING_IDS.NUMBER]: NUMBER
        };
    }

    compatible(type1: TypingResolvable, type2: TypingResolvable) : boolean {
        if (type1 === type2) return true;
        const left = this.resolve(type1);
        const right = this.resolve(type2);
        if (!left || !right) return false;
        if (left.extends === DEFAULT_TYPING_IDS.FUNCTION && right.extends === DEFAULT_TYPING_IDS.FUNCTION) return this.compareParams(left, right);
        return (
            left.extends !== undefined && left.extends === right.extends
            || (left.extends !== undefined && left.extends === right.id)
            || (right.extends !== undefined && right.extends === left.id)
        );
    }

    compareParams(type1: Typing, type2: Typing) : boolean {
        if (!type1.parameters 
            || !type2.parameters 
            || type1.parameters.length !== type2.parameters.length
            || !type1.returns
            || !type2.returns
            || !this.compatible(type1.returns, type2.returns)) return false;
        const paramLen = type1.parameters.length;
        for (let i=0; i < paramLen; i++) {
            if (!this.compatible(type1.parameters[i], type2.parameters[i])) return false;
        }
        return true;
    }

    is(type: TypingResolvable, defaultType: DEFAULT_TYPING_IDS) : boolean {
        if (type === defaultType) return true;
        const realType = this.resolve(type) as Typing;
        if (!realType) return false;
        return realType.id === defaultType || realType.extends === defaultType;
    }

    resolve(type: TypingResolvable) : Typing|undefined {
        if (typeof type === "number") return this.types[type];
        return type;
    }

}