import { ExportType, Section, Type, vec, WasmModule } from './emitter.ts'
import { WasmRuntime } from './runtime.ts'

const wasm = new WasmModule()
  .section(Section.Type, (ctx) =>
    ctx
      .type([Type.i32, Type.i32], [Type.i32])
      .type([], [Type.i32])
      .type([Type.i32, Type.i32], [])
  )
  .section(Section.Import, (ctx) =>
    ctx
      .import('core', 'print', ExportType.Function, 2)
      .import('core', 'memory', ExportType.Memory, 0x00, 0x01)
  )
  .section(Section.Function, (ctx) => ctx.func_type(0).func_type(1))
  .section(Section.Export, (ctx) =>
    ctx
      .export(ExportType.Function, 'add', 1)
      .export(ExportType.Function, 'main', 2)
  )
  .section(Section.Code, (ctx) =>
    ctx
      .func([], (ctx) => ctx.get_local(0).get_local(1).i32_add())
      .func([], (ctx) =>
        ctx
          .i32_const(0)
          .i32_const(72)
          .i32_store8(0, 0)
          .i32_const(0)
          .i32_const(101)
          .i32_store8(0, 1)
          .i32_const(0)
          .i32_const(108)
          .i32_store8(0, 2)
          .i32_const(0)
          .i32_const(108)
          .i32_store8(0, 3)
          .i32_const(0)
          .i32_const(111)
          .i32_store8(0, 4)
          .i32_const(0)
          .i32_const(5)
          .call(0)
          .i32_const(0)
      )
  )
  .write('emit.wasm')
  .build()

const runtime = new WasmRuntime(wasm)
console.log('\n[exited with code', runtime.execute() + ']')
