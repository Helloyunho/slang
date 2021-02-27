import { LexerOptions } from './mod.ts'

export const lexerOptions: LexerOptions = {
  operators: {
    arithmetic: ['+', '-', '*', '/', '%'],
    assignment: ['=', '+=', '-=', '/=', '*=', '%=', '?=', ':='],
    unary: ['++', '--', '!'],
    logical: ['==', '!=', '&&', '||', '<', '<=', '>', '>='],
    binary: ['^', '&', '|'],
    comment: ['//'],
    longComment: ['/*', '*/'],
    other: [':', '.', '??', '?', '(', ')', ',', '?.', ';']
  },
  types: [
    'i32',
    'i64',
    'u32',
    'u64',
    'str',
    'char',
    'bool',
    'null',
    'void',
    'f32',
    'f64'
  ],
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
    'extends',
    'implements',
    'as',
    'while',
    'if',
    'else',
    'for',
    'assert',
    'return'
  ]
}
