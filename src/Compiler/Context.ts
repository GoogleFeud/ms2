
import { OP_CODES } from "../Interpreter";

export interface ICompilerSettings {
    bufferSize?: number
}


export class CompilerContext {
    blockSizes: Array<number>
    offset: number
    lastVariableAddress: number
    variableIndexes: Record<string, number>
    result: Buffer
    lastOpCode?: number
    constructor(settings: ICompilerSettings = {}) {
        this.offset = 0;
        this.lastVariableAddress = 0;
        this.variableIndexes = {};
        this.result = Buffer.alloc(settings.bufferSize || 5000);
        this.blockSizes = [];
    }

    addNumber(num: number, push = false) : void {
        if (num % 1 !== 0) {
            if (push) this.addOpCode(OP_CODES.PUSH_32);
            this.result.writeFloatBE(num, this.offset);
            this.offset += 4;
            if (this.blockSizes.length) this.blockSizes[this.blockSizes.length - 1] += 4;
            return;
        }
        if (num > -129 && num < 128) {
            if (push) this.addOpCode(OP_CODES.PUSH_8);
            this.result.writeUInt8(num, this.offset++);
            if (this.blockSizes.length) this.blockSizes[this.blockSizes.length - 1] += 1;
        } else if (num > -32_768 && num < 32_767) {
            if (push) this.addOpCode(OP_CODES.PUSH_16);
            this.result.writeUInt16BE(num, this.offset);
            this.offset += 2;
            if (this.blockSizes.length) this.blockSizes[this.blockSizes.length - 1] += 2;
        } else {
            if (push) this.addOpCode(OP_CODES.PUSH_32);
            this.result.writeFloatBE(num, this.offset);
            this.offset += 4;
            if (this.blockSizes.length) this.blockSizes[this.blockSizes.length - 1] += 4;
        }
    }

    addUnsigned8(num: number) : void {
        this.result.writeUInt8(num, this.offset);
        this.offset += 1;
        if (this.blockSizes.length) this.blockSizes[this.blockSizes.length - 1] += 1;
    }

    addUnsigned16(num: number) : void {
        this.result.writeUInt16BE(num, this.offset);
        this.offset += 2;
        if (this.blockSizes.length) this.blockSizes[this.blockSizes.length - 1] += 2;
    }

    addBoolOp(val: boolean) : void {
        this.result.writeUInt8(OP_CODES.PUSH_BOOL, this.offset++);
        this.result.writeUInt8(Number(val), this.offset++);
        if (this.blockSizes.length) this.blockSizes[this.blockSizes.length - 1] += 2;
    }

    addUndefinedOp() : void {
        this.result.writeUInt8(OP_CODES.PUSH_UNDEFINED, this.offset++);
        if (this.blockSizes.length) this.blockSizes[this.blockSizes.length - 1] += 1;
    }

    addString(str: string, push = false) : void {
        if (push) this.addOpCode(OP_CODES.PUSH_STR);
        const strLen = str.length;
        this.result.writeUInt16BE(strLen, this.offset);
        this.offset += 2;
        this.result.write(str, this.offset, "utf-8");
        this.offset += strLen;
        if (this.blockSizes.length) this.blockSizes[this.blockSizes.length - 1] += strLen + 2;
    }

    addOpCode(op: OP_CODES) : void {
        this.lastOpCode = op;
        this.result.writeUInt8(op, this.offset++);
        if (this.blockSizes.length) this.blockSizes[this.blockSizes.length - 1] += 1;
    }
    
    addArrayOp(arr: Array<any>) : void {
        for (const item of arr) {
            if (typeof item === "string") this.addString(item, true);
            else if (typeof item === "number") this.addNumber(item, true);
            else if (typeof item === "boolean") this.addBoolOp(item);
            else if (item === undefined || item === null) this.addUndefinedOp();
            else if (item instanceof Array) this.addArrayOp(item);
            else if (typeof item === "object") this.addObjectOp(item);
        }
        this.addOpCode(OP_CODES.PUSH_ARR);
        this.result.writeUInt16BE(arr.length, this.offset);
        this.offset += 2;
        if (this.blockSizes.length) this.blockSizes[this.blockSizes.length - 1] += 2;
    }

    addObjectOp(obj: Record<string, any>) : void {
        // TBD
        this.addArrayOp(Object.values(obj));
    }

    skip(bytes: number) : number {
        const oldOffset = this.offset;
        this.offset += bytes;
        if (this.blockSizes.length) this.blockSizes[this.blockSizes.length - 1] += bytes;
        return oldOffset;
    }

    enterBlock() : void {
        this.blockSizes.push(0);
    }

    exitBlock() : number {
        const funcSize = this.blockSizes.pop() as number;
        if (this.blockSizes.length) {
            this.blockSizes[this.blockSizes.length - 1] += funcSize;
        }
        return funcSize;
    }

    erase(bytes: number) : void {
        this.result.fill(0, this.offset - bytes, this.offset);
        this.offset -= bytes;
        if (this.blockSizes.length) this.blockSizes[this.blockSizes.length - 1] -= bytes;
    }

}