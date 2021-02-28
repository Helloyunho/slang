import {
  encodeString,
  ieee754,
  signedLEB128,
  unsignedLEB128,
} from './encoding.ts'
import { OpCode } from './ops.ts'

const flatten = (arr: any[]) => [].concat.apply([], arr)

export enum Type {
  i32 = 0x7f,
  i64 = 0x7e,
  f32 = 0x7d,
  f64 = 0x7c,
}

export enum Section {
  Custom,
  Type,
  Import,
  Function,
  Table,
  Memory,
  Global,
  Export,
  Start,
  Element,
  Code,
  Data,
}

export enum ExportType {
  Function = 0x00,
  Table = 0x01,
  Memory = 0x02,
  Global = 0x03,
}

export enum BlockType {
  Void = 0x40,
}

export enum GlobalType {
  Const = 0x00,
  Var = 0x01,
}

export const FUNCTION_TYPE = 0x60
export const EMPTY_ARRAY = 0x0
export const LIMITS = [0x00, 0x01]

export const MAGIC_MODULE_HEADER = [0x00, 0x61, 0x73, 0x6d]
export const MODULE_VERSION = [0x01, 0x00, 0x00, 0x00]

export const vec = (data: any[]) => [
  ...unsignedLEB128(data.length),
  ...flatten(data),
]

// https://webassembly.github.io/spec/core/binary/modules.html#code-section
export const encodeLocal = (count: number, type: Type) => [
  ...unsignedLEB128(count),
  type,
]

export function createSection(type: Section, data: number[]) {
  return [type, ...vec(data)]
}

export class BaseWasm {
  code: number[] = []

  push(...code: number[]) {
    code.forEach((e) => this.code.push(e))
    return this
  }

  clear() {
    this.code = []
    return this
  }
}

export class WasmFunctionContext extends BaseWasm {
  get_local(idx: number) {
    this.push(OpCode.LocalGet)
    this.push(...unsignedLEB128(idx))
    return this
  }

  set_local(idx: number) {
    this.push(OpCode.LocalSet)
    this.push(...unsignedLEB128(idx))
    return this
  }

  i32_add() {
    this.push(OpCode.i32_Add)
    return this
  }

  f32_add() {
    this.push(OpCode.f32_Add)
    return this
  }

  i64_add() {
    this.push(OpCode.i64_Add)
    return this
  }

  f64_add() {
    this.push(OpCode.f64_Add)
    return this
  }

  i32_const(val: number) {
    this.push(OpCode.i32_Const)
    this.push(...signedLEB128(val))
    return this
  }

  i64_const(val: number) {
    this.push(OpCode.i64_Const)
    this.push(...signedLEB128(val))
    return this
  }

  f32_const(val: number) {
    this.push(OpCode.f32_Const)
    this.push(...ieee754(val))
    return this
  }

  f64_const(val: number) {
    this.push(OpCode.f64_Const)
    this.push(...ieee754(val, true))
    return this
  }

  nop() {
    this.push(OpCode.Nop)
    return this
  }

  unreachable() {
    this.push(OpCode.Unreachable)
    return this
  }

  end() {
    this.push(OpCode.End)
    return this
  }

  block(type: BlockType) {
    this.push(OpCode.Block)
    this.push(...unsignedLEB128(type))
    return this
  }

  if(type: BlockType) {
    this.push(OpCode.If)
    this.push(...unsignedLEB128(type))
    return this
  }

  else() {
    return this
  }

  return() {
    this.push(OpCode.Return)
    return this
  }

  br(idx: number) {
    this.push(OpCode.Br)
    this.push(...unsignedLEB128(idx))
    return this
  }

  br_if(idx: number) {
    this.push(OpCode.BrIf)
    this.push(...unsignedLEB128(idx))
    return this
  }

  br_trable(vecidx: number[], idx: number) {
    this.push(OpCode.BrTable)
    this.push(...vec(vecidx))
    this.push(...unsignedLEB128(idx))
    return this
  }

  call(idx: number) {
    this.push(OpCode.Call)
    this.push(...unsignedLEB128(idx))
    return this
  }

  call_indirect(type: number) {
    this.push(OpCode.CallIndirect)
    this.push(...unsignedLEB128(type))
    return this
  }

  i32_store(align: number, offset: number) {
    this.push(OpCode.i32_Store)
    this.push(...unsignedLEB128(align))
    this.push(...unsignedLEB128(offset))
    return this
  }

  i32_store8(align: number, offset: number) {
    this.push(OpCode.i32_Store8)
    this.push(...unsignedLEB128(align))
    this.push(...unsignedLEB128(offset))
    return this
  }

  i32_store16(align: number, offset: number) {
    this.push(OpCode.i32_Store16)
    this.push(...unsignedLEB128(align))
    this.push(...unsignedLEB128(offset))
    return this
  }

  i32_load(align: number, offset: number) {
    this.push(OpCode.i32_Load)
    this.push(...unsignedLEB128(align))
    this.push(...unsignedLEB128(offset))
    return this
  }

  i32_load8u(align: number, offset: number) {
    this.push(OpCode.i32_Load8U)
    this.push(...unsignedLEB128(align))
    this.push(...unsignedLEB128(offset))
    return this
  }

  i32_load8s(align: number, offset: number) {
    this.push(OpCode.i32_Load8S)
    this.push(...unsignedLEB128(align))
    this.push(...unsignedLEB128(offset))
    return this
  }

  i32_load16u(align: number, offset: number) {
    this.push(OpCode.i32_Load16U)
    this.push(...unsignedLEB128(align))
    this.push(...unsignedLEB128(offset))
    return this
  }

  i32_load16s(align: number, offset: number) {
    this.push(OpCode.i32_Load16S)
    this.push(...unsignedLEB128(align))
    this.push(...unsignedLEB128(offset))
    return this
  }
}

export class WasmContext extends BaseWasm {
  funcs: number[][] = []
  types: number[][] = []
  func_types: number[] = []
  exports: number[][] = []
  imports: number[][] = []
  data: number[][] = []

  func(locals: [Type, number][], cb: (ctx: WasmFunctionContext) => any) {
    const ctx = new WasmFunctionContext()
    cb(ctx)
    const localVec: number[] = []
    locals.forEach((e) => {
      encodeLocal(e[1], e[0]).forEach((e) => localVec.push(e))
    })
    const code = vec([...vec(localVec), ...ctx.code, OpCode.End])
    this.funcs.push(code)
    return this
  }

  type(args: Type[], returns: Type[]) {
    this.types.push([FUNCTION_TYPE, ...vec(args), ...vec(returns)])
    return this
  }

  func_type(idx: number) {
    this.func_types.push(idx)
    return this
  }

  export(type: ExportType, name: string, idx: number) {
    this.exports.push([...encodeString(name), type, idx])
    return this
  }

  import(ns: string, name: string, type: ExportType, ...args: number[]) {
    this.imports.push([
      ...encodeString(ns),
      ...encodeString(name),
      type,
      ...args,
    ])
    return this
  }

  dataseg(...bytes: number[]) {
    this.data.push(vec(bytes))
    return this
  }
}

export class WasmModule extends BaseWasm {
  constructor() {
    super()
    this.clear()
  }

  section(type: Section, cb: (ctx: WasmContext) => any) {
    const ctx = new WasmContext()
    cb(ctx)
    let sec
    if (type === Section.Code) {
      sec = createSection(type, vec(ctx.funcs))
    } else if (type === Section.Type) {
      sec = createSection(type, vec(ctx.types))
    } else if (type === Section.Function) {
      sec = createSection(type, vec(ctx.func_types))
    } else if (type === Section.Export) {
      sec = createSection(type, vec(ctx.exports))
    } else if (type === Section.Import) {
      sec = createSection(type, vec(ctx.imports))
    } else if (type === Section.Data) {
      sec = createSection(type, vec(ctx.data))
    } else sec = createSection(type, ctx.code)
    this.push(...sec)
    return this
  }

  clear() {
    this.code = [...MAGIC_MODULE_HEADER, ...MODULE_VERSION]
    return this
  }

  build() {
    return Uint8Array.from(this.code)
  }

  write(path: string) {
    Deno.writeFileSync(path, this.build())
    return this
  }
}
