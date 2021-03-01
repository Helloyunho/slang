import {
  ExportType,
  Section,
  Type,
  WasmBinaryModule,
  WasmFunctionContext,
} from './emitter.ts'

export interface WasmFunctionType {
  params: Type[]
  returns: Type[]
}

export interface WasmFunctionBase extends WasmFunctionType {
  name: string
}

export interface WasmFunction extends WasmFunctionBase {
  locals: any[]
  body: number[]
}

export interface WasmImportBase {
  module: string
  name: string
}

export interface WasmFunctionImport extends WasmImportBase, WasmFunctionBase {}
export interface WasmMemoryImport extends WasmImportBase {
  limits: [number, number]
}

export function arrayEquals(arr1: any[], arr2: any[]) {
  if (arr1.length !== arr2.length) return false
  for (let i in arr1) {
    if (arr1[i] !== arr2[i]) return false
  }
  return true
}

export class WasmModule {
  bin: WasmBinaryModule
  funcNames: string[] = []
  functions: WasmFunction[] = []
  functionExports: [string, string][] = []
  functionImports: WasmFunctionImport[] = []
  memoryImports: WasmMemoryImport[] = []
  definedFunctionTypes: WasmFunctionBase[] = []

  constructor() {
    this.bin = new WasmBinaryModule()
  }

  addFunction(
    meta: WasmFunctionBase & { locals: any[] },
    cb: (ctx: WasmFunctionContext) => any
  ) {
    const ctx = new WasmFunctionContext()
    cb(ctx)
    let data: WasmFunction = Object.assign(
      { ...meta },
      { body: ctx.code }
    ) as any
    this.functions.push(data)
    return this
  }

  defineFunctionType(type: WasmFunctionBase) {
    this.definedFunctionTypes.push(type)
    return this
  }

  importMemory(mem: WasmMemoryImport) {
    this.memoryImports.push(mem)
    return this
  }

  importFunction(fn: WasmFunctionImport) {
    this.functionImports.push(fn)
    return this
  }

  exportFunction(name: string, as?: string) {
    this.functionExports.push([name, as ?? name])
    return this
  }

  build() {
    const types: WasmFunctionType[] = []
    const findType = (fn: WasmFunctionType) =>
      types.findIndex(
        (e) =>
          arrayEquals(e.params, fn.params) && arrayEquals(e.returns, fn.returns)
      )

    this.funcNames = [
      ...this.functionImports.map((e) => e.name),
      ...this.functions.map((e) => e.name),
    ]
    ;[
      ...this.functions,
      ...this.definedFunctionTypes,
      ...this.functionImports,
    ].forEach((fn) => {
      let f = findType(fn)
      if (f > -1) return
      else types.push({ params: fn.params, returns: fn.returns })
    })

    this.bin.section(Section.Type, (ctx) => {
      types.forEach((func) => {
        ctx.type(func.params, func.returns)
      })
    })

    this.bin.section(Section.Import, (ctx) => {
      this.functionImports.forEach((imp) => {
        ctx.import(imp.module, imp.name, ExportType.Function, findType(imp))
      })
      this.memoryImports.forEach((mem) => {
        ctx.import(mem.module, mem.name, ExportType.Memory, ...mem.limits)
      })
    })

    this.bin.section(Section.Function, (ctx) => {
      this.functions.forEach((fn) => {
        let type = findType(fn)
        if (type < 0) return
        ctx.func_type(type)
      })
    })

    this.bin.section(Section.Export, (ctx) => {
      this.functionExports.forEach((fn) => {
        ctx.export(
          ExportType.Function,
          fn[1],
          this.funcNames.findIndex((e) => e == fn[0])
        )
      })
    })

    this.bin.section(Section.Code, (ctx) => {
      this.functions.forEach((fn) => {
        ctx.func(fn.locals, (c) => c.push(...fn.body))
      })
    })

    return this.bin.build()
  }
}
