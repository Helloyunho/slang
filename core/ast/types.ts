import { Position } from '../lexer/mod.ts'

export enum NodeType {
  Variable,
  Function,
  Import,
  Class,
  For,
  While,
  Condition
}

export type ReturnsValue =
  | CallFunctionExpression
  | ArithmeticOperator
  | LogicalOperator
  | BinaryOperator
  | UnaryOperator
  | Identifier
  | AccessDotExpression
  | AccessWithArrayLikeExpression
  | StringParsed
  | NumberParsed
  | FloatParsed
  | BooleanParsed
  | NullParsed
  | ArrayParsed
  | AssignVariableStatement
  | FunctionStatement
  | TypeChangeExpression
  | DictParsed
  | ConditionStatement
  | InitializeVariableStatement

export interface Positions {
  start: Position
  end: Position
}

export interface Identifier extends Positions {
  type: 'Identifier'
  name: string
}

export interface CallFunctionExpression extends Positions {
  type: 'CallFunctionExpression'
  what: ReturnsValue
  params: ReturnsValue[]
}

export interface ArithmeticOperator extends Positions {
  type: 'ArithmeticOperator'
  left: ReturnsValue
  operator: '+' | '-' | '*' | '/' | '%'
  right: ReturnsValue
}

export interface UnaryOperator extends Positions {
  type: 'UnaryOperator'
  value: ReturnsValue
  operator: '++' | '--' | '!' | '+' | '-'
  location: 'left' | 'right'
}

export interface LogicalOperator extends Positions {
  type: 'LogicalOperator'
  left: ReturnsValue
  operator: '==' | '!=' | '&&' | '||' | '<' | '<=' | '>' | '>='
  right: ReturnsValue
}

export interface BinaryOperator extends Positions {
  type: 'BinaryOperator'
  left: ReturnsValue
  operator: '^' | '&' | '|'
  right: ReturnsValue
}

export interface AccessDotExpression extends Positions {
  type: 'AccessDotExpression'
  left: Identifier | CallFunctionExpression | AccessWithArrayLikeExpression
  right:
    | Identifier
    | CallFunctionExpression
    | AccessDotExpression
    | AccessWithArrayLikeExpression
  returnNull: boolean
}

export interface AccessWithArrayLikeExpression extends Positions {
  type: 'AccessWithArrayLikeExpression'
  left: Identifier | CallFunctionExpression | AccessDotExpression
  right: ReturnsValue
}

export interface TypeChangeExpression extends Positions {
  type: 'TypeChangeExpression'
  value: ReturnsValue
  toType: Types
  returnNull: boolean
}

export interface StringParsed extends Positions {
  type: 'StringParsed'
  value: string
}

export interface NumberParsed extends Positions {
  type: 'NumberParsed'
  value: number
}

export interface FloatParsed extends Positions {
  type: 'FloatParsed'
  value: number
}

export interface BooleanParsed extends Positions {
  type: 'BooleanParsed'
  value: boolean
}

export interface NullParsed extends Positions {
  type: 'NullParsed'
}

export interface ArrayParsed extends Positions {
  type: 'ArrayParsed'
  elements: ReturnsValue[]
}

export interface DictElement extends Positions {
  name: Identifier
  value: ReturnsValue
}

export interface DictParsed extends Positions {
  type: 'DictParsed'
  elements: DictElement[]
}

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
  | 'f32'
  | 'f64'

export interface Types extends Positions {
  type: 'Types'
  value: Array<TypeValues | ReturnsValue | Types>
  arrayLength?: number
}

export interface InitializeVariableStatement extends Positions {
  type: 'InitializeVariableStatement'
  const: boolean
  name: Identifier
  variableType?: Types
  value?: ReturnsValue
  export?: boolean
}

export interface AssignVariableStatement extends Positions {
  type: 'AssignVariableStatement'
  target:
    | AccessDotExpression
    | Identifier
    | CallFunctionExpression
    | AccessWithArrayLikeExpression
  operator: string
  value: ReturnsValue
  export?: boolean
}

export interface FunctionParameter extends Positions {
  name: Identifier
  returnType: Types
  default?: ReturnsValue
}

export interface BlockStatement extends Positions {
  type: 'BlockStatement'
  body: Node[]
}

export interface FunctionStatement extends Positions {
  type: 'FunctionStatement'
  name?: Identifier
  params: FunctionParameter[]
  returnType: Types
  export?: boolean
  block: BlockStatement
}

export interface InterfaceElements extends Positions {
  name: Identifier
  returnType: Types
}

export interface InterfaceStatement extends Positions {
  type: 'InterfaceStatement'
  name: Identifier
  elements: InterfaceElements[]
}

export interface ImportStatement extends Positions {
  type: 'ImportStatement'
  what: Identifier[]
  from: StringParsed
}

export interface ExportStatement extends Positions {
  type: 'ExportStatement'
  what: Identifier[]
  from?: StringParsed
}

export interface ClassStatement extends Positions {
  type: 'ClassStatement'
  name: Identifier
  extends?: AccessDotExpression | Identifier
  implements?: AccessDotExpression | Identifier
  properties: InitializeVariableStatement[]
  methods: FunctionStatement[]
  initializer?: FunctionStatement
}

export interface ForStatement extends Positions {
  type: 'ForStatement'
  variable: InitializeVariableStatement
  condition: ReturnsValue
  increment: ReturnsValue
  block: BlockStatement
}

export interface WhileStatement extends Positions {
  type: 'WhileStatement'
  condition: ReturnsValue
  block: BlockStatement
}

export interface ConditionStatement extends Positions {
  type: 'ConditionStatement'
  condition?: ReturnsValue
  elseBody?: ConditionStatement
  block: BlockStatement
}

export interface ReturnStatement extends Positions {
  type: 'ReturnStatement'
  value: ReturnsValue
}

export type Node =
  | ReturnsValue
  | InitializeVariableStatement
  | FunctionStatement
  | ClassStatement
  | ForStatement
  | WhileStatement
  | ConditionStatement
  | FunctionStatement
  | ReturnStatement
  | InterfaceStatement

export type GlobalNode = Node | ImportStatement | ExportStatement

export interface GlobalBlockStatement extends Positions {
  type: 'GlobalBlockStatement'
  body: GlobalNode[]
}
