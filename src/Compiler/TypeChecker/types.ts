
export const enum TYPING_IDS {
    UNKNOWN,
    NULL,
    NUMBER,
    STRING,
    BOOLEAN,
    ARRAY,
    FUNCTION
}

export type TypingResolvable = Typing|number|undefined;

export interface Typing {
    id?: number,
    options?: Array<TypingResolvable>
    extends?: TypingResolvable,
    properties?: Record<string, TypingResolvable>
    parameters?: Array<TypingResolvable>,
    returns?: TypingResolvable,
    nullable?: boolean,
    readonly?: boolean
}

export const FUNCTION: Typing = {id: TYPING_IDS.FUNCTION};
export const UNKNOWN: Typing = {id: TYPING_IDS.UNKNOWN};
export const NULL: Typing = {id: TYPING_IDS.NULL};
export const NUMBER: Typing = {id: TYPING_IDS.NUMBER};
export const BOOLEAN: Typing = {id: TYPING_IDS.BOOLEAN};
export const STRING: Typing = {
    id: TYPING_IDS.STRING,
    properties: {
        charAt: {extends: TYPING_IDS.FUNCTION, parameters: [TYPING_IDS.NUMBER], returns: TYPING_IDS.STRING},
        startsWith: {extends: TYPING_IDS.FUNCTION, parameters: [TYPING_IDS.STRING], returns: TYPING_IDS.BOOLEAN},
        endsWith: {extends: TYPING_IDS.FUNCTION, parameters: [TYPING_IDS.STRING], returns: TYPING_IDS.BOOLEAN},
        replace: {extends: TYPING_IDS.FUNCTION, parameters: [TYPING_IDS.STRING, TYPING_IDS.STRING], returns: TYPING_IDS.STRING},
        includes: {extends: TYPING_IDS.FUNCTION, parameters: [TYPING_IDS.STRING], returns: TYPING_IDS.BOOLEAN},
        toUpperCase: {extends: TYPING_IDS.FUNCTION, returns: TYPING_IDS.STRING},
        toLowerCase: {extends: TYPING_IDS.FUNCTION, returns: TYPING_IDS.STRING},
        slice: {extends: TYPING_IDS.FUNCTION, parameters: [TYPING_IDS.NUMBER, {extends: TYPING_IDS.NUMBER, nullable: true}], returns: TYPING_IDS.STRING},
        length: {extends: TYPING_IDS.NUMBER, readonly: true}
    }
};
export const ARRAY: Typing = {
    id: TYPING_IDS.ARRAY,
    properties: {
        length: {extends: TYPING_IDS.NUMBER, readonly: true},
        push: {extends: TYPING_IDS.FUNCTION, parameters: [TYPING_IDS.UNKNOWN], returns: TYPING_IDS.NUMBER},
        pop: {extends: TYPING_IDS.FUNCTION, returns: TYPING_IDS.UNKNOWN}
    }
};
