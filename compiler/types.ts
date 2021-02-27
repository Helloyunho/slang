import { Identifier, Positions } from '../core/ast/types.ts'
export type {
  InterfaceElements,
  InterfaceStatement,
  Identifier
} from '../core/ast/types.ts'

export type TypeValues =
  | 'void'
  | 'i32'
  | 'i64'
  | 'u32'
  | 'u64'
  | 'str'
  | 'char'
  | 'bool'
  | 'null'

export interface Variable extends Positions {
  type: 'Variable'
  name: Identifier
  variableType: TypeValues[]
  const: boolean
}

export interface Function extends Positions {
  type: 'Function'
  name: Identifier
  params: TypeValues[][]
  returnType: TypeValues[]
}

export interface Class extends Positions {
  type: 'Class'
  name: Identifier
  variables: Variable[]
  functions: Function[]
}
