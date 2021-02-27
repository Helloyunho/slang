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
}

export class WasmContext extends BaseWasm {
  funcs: number[][] = []
  types: number[][] = []
  func_types: number[] = []
  exports: number[][] = []

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

  init(imports?: WebAssembly.Imports) {
    const build = this.build()
    console.log(
      '[emit]',
      this.code.filter((_, i) => i > 7).map((e) => e.toString(16))
    )
    const mod = new WebAssembly.Module(build)
    return new WebAssembly.Instance(mod, imports)
  }
}
