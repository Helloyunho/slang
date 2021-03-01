import { WasmCompiler } from '../compiler/target/wasm/mod.ts'
import { WasmRuntime } from '../compiler/target/wasm/runtime.ts'
import { AST } from '../core/ast/mod.ts'
import { Lexer } from '../core/lexer/mod.ts'
import { lexerOptions } from '../core/lexer/rules.ts'
import { Command } from './deps.ts'

await new Command()
  .name('slang')
  .version('0.0.0')
  .description(
    "Simple and fast 'cross-language' general purpose programming language"
  )
  .command(
    'init [name:string]',
    new Command()
      .option('-g, --git', 'Initialize a Git Repository')
      .description('Create/Initialize a slang project')
      .action((_, name) => {})
  )
  .command(
    'run [file:string]',
    new Command()
      .description('Run your Slang code in WASM Runtime')
      .action((_, file) => {
        let code: string
        try {
          code = Deno.readTextFileSync(file)
        } catch (e) {
          console.log(`file not found: ${file}`)
          return
        }
        const lexer = new Lexer(lexerOptions)
        const res = lexer.parse(code)
        const ast = new AST(res.tokens)
        const wasm = new WasmCompiler(ast).compile()
        const runtime = new WasmRuntime(wasm)
        const exit = runtime.execute()
        console.log(`\n[exited with code ${exit}]`)
      })
  )
  .help('Use with --help flag for more info.')
  .parse(Deno.args)
