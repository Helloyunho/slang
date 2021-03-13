import {
  ClassStatement,
  FunctionStatement,
  InitializeVariableStatement,
  InterfaceStatement
} from '../../core/ast/types.ts'

type CanBeVariables =
  | InitializeVariableStatement
  | FunctionStatement
  | ClassStatement
  | InterfaceStatement

export class State extends Map<string, CanBeVariables> {
  constructor(parent?: State) {
    if (parent !== undefined) {
      super(parent.entries())
    } else {
      super()
    }
  }
}
