import type { AST } from './mod.ts'

export class Base {
  AST: AST

  constructor(AST: AST) {
    this.AST = AST
  }
}
