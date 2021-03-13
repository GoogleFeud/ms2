
export const enum DEFAULT_TYPING_IDS {
    UNKNOWN,
    NULL,
    NUMBER,
    STRING,
    BOOLEAN,
    ARRAY,
    FUNCTION
}

export type TypingResolvable = Typing|number;

export interface Typing {
    id?: number,
    extends?: TypingResolvable,
    properties?: Record<string, TypingResolvable>
    parameters?: Array<TypingResolvable>,
    returns?: TypingResolvable,
    nullable?: boolean,
    readonly?: boolean
}

export const FUNCTION: Typing = {id: DEFAULT_TYPING_IDS.FUNCTION};
export const UNKNOWN: Typing = {id: DEFAULT_TYPING_IDS.UNKNOWN};
export const NULL: Typing = {id: DEFAULT_TYPING_IDS.NULL};
export const NUMBER: Typing = {id: DEFAULT_TYPING_IDS.NUMBER};
export const BOOLEAN: Typing = {id: DEFAULT_TYPING_IDS.BOOLEAN};
export const STRING: Typing = {
    id: DEFAULT_TYPING_IDS.STRING,
    properties: {
        charAt: {extends: DEFAULT_TYPING_IDS.FUNCTION, parameters: [DEFAULT_TYPING_IDS.NUMBER], returns: DEFAULT_TYPING_IDS.STRING},
        startsWith: {extends: DEFAULT_TYPING_IDS.FUNCTION, parameters: [DEFAULT_TYPING_IDS.STRING], returns: DEFAULT_TYPING_IDS.BOOLEAN},
        endsWith: {extends: DEFAULT_TYPING_IDS.FUNCTION, parameters: [DEFAULT_TYPING_IDS.STRING], returns: DEFAULT_TYPING_IDS.BOOLEAN},
        replace: {extends: DEFAULT_TYPING_IDS.FUNCTION, parameters: [DEFAULT_TYPING_IDS.STRING, DEFAULT_TYPING_IDS.STRING], returns: DEFAULT_TYPING_IDS.STRING},
        includes: {extends: DEFAULT_TYPING_IDS.FUNCTION, parameters: [DEFAULT_TYPING_IDS.STRING], returns: DEFAULT_TYPING_IDS.BOOLEAN},
        toUpperCase: {extends: DEFAULT_TYPING_IDS.FUNCTION, returns: DEFAULT_TYPING_IDS.STRING},
        toLowerCase: {extends: DEFAULT_TYPING_IDS.FUNCTION, returns: DEFAULT_TYPING_IDS.STRING},
        slice: {extends: DEFAULT_TYPING_IDS.FUNCTION, parameters: [DEFAULT_TYPING_IDS.NUMBER, {extends: DEFAULT_TYPING_IDS.NUMBER, nullable: true}], returns: DEFAULT_TYPING_IDS.STRING},
        length: {extends: DEFAULT_TYPING_IDS.NUMBER, readonly: true}
    }
};
export const ARRAY: Typing = {
    id: DEFAULT_TYPING_IDS.ARRAY,
    properties: {
        length: {extends: DEFAULT_TYPING_IDS.NUMBER, readonly: true},
        push: {extends: DEFAULT_TYPING_IDS.FUNCTION, parameters: [DEFAULT_TYPING_IDS.UNKNOWN], returns: DEFAULT_TYPING_IDS.NUMBER},
        pop: {extends: DEFAULT_TYPING_IDS.FUNCTION, returns: DEFAULT_TYPING_IDS.UNKNOWN}
    }
};
