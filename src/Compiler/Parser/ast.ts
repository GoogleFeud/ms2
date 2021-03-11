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

export interface AST_Block {
    type: AST_TYPES,
    elements: Array<AST_Node>
}

export interface AST_String {
    type: AST_TYPES
    value: string
}

export interface AST_Number {
    type: AST_TYPES
    value: number
}

export interface AST_Id {
    type: AST_TYPES
    value: string
}

export interface AST_Boolean {
    type: AST_TYPES
    value: boolean
}

export interface AST_Null {
    type: AST_TYPES.NULL
}

export interface AST_Array {
    type: AST_TYPES
    elements: Array<AST_Node>
}

export interface AST_Binary {
    type: AST_TYPES,
    left: AST_Node,
    right: AST_Node,
    operator: string
}

export interface AST_Define {
    type: AST_TYPES,
    declarations: Array<string>,
    defineType: "let"|"const"
    initializor?: AST_Node
}

export interface AST_Not {
    type: AST_TYPES
    expression: AST_Node
}

export interface AST_If {
    type: AST_TYPES,
    condition: AST_Node,
    then: AST_Node,
    else?: AST_Node
}

export interface AST_Fn {
    type: AST_TYPES,
    params: Array<string>,
    body: AST_Node
}

export interface AST_Access {
    type: AST_TYPES,
    start: AST_Node,
    accessor: AST_Node
}


export interface AST_Call {
    type: AST_TYPES,
    fn?: AST_Node,
    params: Array<AST_Node>
}

export interface AST_Return {
    type: AST_TYPES,
    value?: AST_Node
}

export interface AST_Struct {
    type: AST_TYPES,
    name: string,
    fields: Array<{name: string, defaultValue?: AST_Node}>
}

export interface AST_Struct_Init {
    type: AST_TYPES,
    name: string,
    fields: Array<[string, AST_Node]>
}

export type SkipParse = 1;