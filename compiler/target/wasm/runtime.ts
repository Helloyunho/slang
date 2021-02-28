export const decoder = new TextDecoder('utf-8')

export class WasmRuntime {
  module: WebAssembly.Module
  instance: WebAssembly.Instance
  memory: WebAssembly.Memory
  imports: WebAssembly.Imports = {}

  get exports(): any {
    return this.instance.exports
  }

  get buffer(): Uint8Array {
    return new Uint8Array(this.memory.buffer)
  }

  constructor(code: Uint8Array) {
    this.memory = new WebAssembly.Memory({ initial: 2 })
    this.module = new WebAssembly.Module(code)
    this.fillImports()
    this.instance = new WebAssembly.Instance(this.module, this.imports)
  }

  fillImports() {
    const self = this
    this.imports.core = {
      memory: this.memory,
      print(ptr: number, len: number) {
        Deno.stdout.writeSync(self.buffer.slice(ptr, ptr + len))
      },
    }
  }

  execute(): number {
    return this.exports.main() ?? 0
  }
}
