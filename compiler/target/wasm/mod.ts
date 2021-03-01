import { AST } from '../../../core/ast/mod.ts'
import {
  FunctionStatement,
  GlobalBlockStatement,
} from '../../../core/ast/types.ts'
import { Type } from './emitter.ts'
import { WasmModule } from './module.ts'

export class WasmCompiler {
  root: GlobalBlockStatement

  constructor(ast: AST) {
    this.root = ast.statements.globalBlockStatement()
    // console.log(
    //   Deno.inspect(this.root, {
    //     depth: Infinity,
    //     colors: true,
    //   })
    // )
  }

  compile() {
    const wasm = new WasmModule()
    const main: FunctionStatement = this.root.body.find(
      (e) => e.type === 'FunctionStatement' && e.name?.name === 'main'
    ) as any
    if (!main) throw new Error("No 'main' function in program!")
    if (
      main.returnType.length > 1 ||
      (main.returnType.length === 1 &&
        main.returnType[0]?.value !== 'i32' &&
        main.returnType[0]?.value !== 'void')
    )
      throw new Error('main function may only return i32 or void')

    wasm.importFunction({
      module: 'core',
      name: 'stdout_write',
      params: [Type.i32, Type.i32],
      returns: [],
    })
    wasm.importMemory({
      module: 'core',
      name: 'memory',
      limits: [0x00, 0x01],
    })

    wasm.addFunction(
      {
        name: 'main',
        params: [],
        returns: main.returnType[0].value === 'i32' ? [Type.i32] : [],
        locals: [],
      },
      (ctx) => {
        main.block.body.forEach((body) => {
          if (body.type === 'ReturnStatement') {
            if (body.value.type === 'NumberParsed') {
              ctx.i32_const(body.value.value)
              ctx.return()
            }
          }
        })
      }
    )

    wasm.exportFunction('main')

    return wasm.build()
  }
}
