import { LOC } from "./InputStream";

export const enum AST_TYPES {
    STRING,
    NUMBER,
    ID,
    BOOL,
    NULL,
    ARRAY,
    BINARY,
    NOT,
    IF,
    DEFINE,
    ASSIGN,
    ACCESS,
    CALL,
    LOOP,
    BLOCK,
    FN,
    STRUCT,
    STRUCT_INIT,
    RETURN
}

export type AST_Node = AST_Struct|AST_Struct_Init|AST_Block|AST_String|AST_Number|AST_Boolean|AST_Null|AST_Array|AST_Binary|AST_Not|AST_If|AST_Fn|AST_Block|AST_Access|AST_Call|AST_Return;

export interface AST_Base extends LOC {
    type: AST_TYPES
}

export interface AST_Block extends AST_Base {
    elements: Array<AST_Node>
}

export interface AST_String extends AST_Base {
    value: string
}

export interface AST_Number extends AST_Base {
    value: number
}

export interface AST_Id extends AST_Base {
    value: string
}

export interface AST_Boolean extends AST_Base {
    value: boolean
}

export interface AST_Null extends AST_Base {
    type: AST_TYPES
}

export interface AST_Array extends AST_Base {
    elements: Array<AST_Node>
}

export interface AST_Binary extends AST_Base {
    left: AST_Node,
    right: AST_Node,
    operator: string
}

export interface AST_Define extends AST_Base {
    declarations: Array<string>,
    defineType: "let"|"const"
    initializor?: AST_Node
}

export interface AST_Not extends AST_Base {
    expression: AST_Node
}

export interface AST_If extends AST_Base {
    condition: AST_Node,
    then: AST_Node,
    else?: AST_Node
}

export interface AST_Fn extends AST_Base {
    params: Array<string>,
    body: AST_Node
}

export interface AST_Access extends AST_Base {
    start: AST_Node,
    optional: boolean,
    accessor: AST_Node
}

export interface AST_Call extends AST_Base {
    fn?: AST_Node,
    params: Array<AST_Node>
}

export interface AST_Return extends AST_Base {
    value?: AST_Node
}

export interface AST_Struct extends AST_Base {
    name: string,
    fields: Array<{name: string, defaultValue?: AST_Node, optional: boolean}>
}

export interface AST_Struct_Init extends AST_Base {
    name: string,
    fields: Array<[string, AST_Node]>
}

export type SkipParse = 1;