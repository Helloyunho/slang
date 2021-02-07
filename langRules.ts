import { LexerOptions } from './lexer.ts'

export const lexerOptions: LexerOptions = {
  operators: {
    arithmetic: ['+', '-', '*', '/', '%', '++', '--'],
    assignment: ['=', '+=', '-=', '/=', '*=', '%=', '?='],
    logical: ['==', '!=', '&&', '||'],
    binary: ['^', '&', '|'],
    comment: ['//'],
    longComment: ['/*', '*/'],
    other: [':', '.', '??', '?', '(', ')']
  },
  types: ['i32', 'i64', 'u32', 'u64', 'str', 'char', 'bool', 'null', 'void'],
  keywords: [
    'let',
    'const',
    'func',
    'import',
    'export',
    'class',
    'interface',
    'true',
    'false',
    'this',
    'extends',
    'implements',
    'as',
    'while',
    'if',
    'else',
    'for',
    'assert'
  ]
}
