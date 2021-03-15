
import {Typing, TypingResolvable, UNKNOWN, STRING, NUMBER, NULL, BOOLEAN, ARRAY, TYPING_IDS} from "./types";


const types: Record<number, Typing> = {
    [TYPING_IDS.UNKNOWN]: UNKNOWN,
    [TYPING_IDS.STRING]: STRING,
    [TYPING_IDS.NULL]: NULL,
    [TYPING_IDS.BOOLEAN]: BOOLEAN,
    [TYPING_IDS.ARRAY]: ARRAY,
    [TYPING_IDS.NUMBER]: NUMBER
};

export function compatible(type1: TypingResolvable, type2: TypingResolvable) : boolean {
    if (type1 === type2) return true;
    const left = resolve(type1);
    const right = resolve(type2);
    if (!left || !right) return false;
    if (left.extends === TYPING_IDS.FUNCTION && right.extends === TYPING_IDS.FUNCTION) return compareParams(left, right);
    return (
        left.extends !== undefined && left.extends === right.extends
            || (left.extends !== undefined && left.extends === right.id)
            || (right.extends !== undefined && right.extends === left.id)
    );
}

export function compareParams(type1: Typing, type2: Typing) : boolean {
    if (!type1.parameters 
            || !type2.parameters 
            || type1.parameters.length !== type2.parameters.length
            || !type1.returns
            || !type2.returns
            || !compatible(type1.returns, type2.returns)) return false;
    const paramLen = type1.parameters.length;
    for (let i=0; i < paramLen; i++) {
        if (!compatible(type1.parameters[i], type2.parameters[i])) return false;
    }
    return true;
}

export function is(type: TypingResolvable, defaultType: TYPING_IDS) : boolean {
    if (type === defaultType) return true;
    const realType = resolve(type) as Typing;
    if (!realType) return false;
    return realType.id === defaultType || realType.extends === defaultType;
}

export function resolve(type: TypingResolvable) : Typing|undefined {
    if (typeof type === "number") return types[type];
    return type;
}