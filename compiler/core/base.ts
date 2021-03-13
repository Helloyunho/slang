import type { TypeChecker } from './mod.ts'

export class Base {
  typeChecker: TypeChecker

  constructor(typeChecker: TypeChecker) {
    this.typeChecker = typeChecker
  }
}
