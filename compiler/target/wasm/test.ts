import { ExportType, Section, Type, WasmModule } from './emitter.ts'

const actual = Deno.readFileSync('test.wasm')
console.log(
  '[conv]',
  [...actual].filter((_, i) => i > 7).map((e) => e.toString(16))
)
const wasm = new WasmModule()
  .section(Section.Type, (ctx) => ctx.type([Type.f64, Type.f64], [Type.f64]))
  .section(Section.Function, (ctx) => ctx.func_type(0))
  .section(Section.Export, (ctx) => ctx.export(ExportType.Function, 'add', 0))
  .section(Section.Code, (ctx) =>
    ctx.func([], (ctx) =>
      ctx.get_local(0).get_local(1).f64_add().f64_const(10).f64_add()
    )
  )
  .write('emit.wasm')
  .init()

console.log('call add', (wasm.exports.add as CallableFunction)(60, 8))
