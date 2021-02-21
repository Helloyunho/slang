import { AST } from './ast/index.ts'
import { lexerOptions } from './langRules.ts'
import { Lexer, LexerOptions, TokenType } from './lexer.ts'

const lexer = new Lexer(lexerOptions)

const code = Deno.readTextFileSync('lexerTest.txt')
const data = lexer.parse(code)

if (data.tokens.length) {
  console.log('== Tokens ==')
  for (let token of data.tokens) {
    console.log(
      `- [${TokenType[token.type]}] "${token.value}" at debug:${
        token.start.line
      }:${token.start.col}-debug:${token.end.line}:${token.end.col}`
    )
  }
}

if (data.errors.length) {
  console.log('== Errors ==')
  for (let err of data.errors) {
    console.log(`- error: ${err.msg} at debug:${err.line}:${err.col}`)
  }
}

const ast = new AST(data.tokens)
console.log(
  Deno.inspect(ast.statements.globalBlockStatement(), {
    colors: true,
    depth: Infinity,
    iterableLimit: Infinity
  })
)
