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
  | AccessVariableExpression
  | AccessDotExpression
  | AccessWithArrayLikeExpression
  | StringParsed
  | NumberParsed
  | BooleanParsed
  | NullParsed
  | ArrayParsed
  | AssignVariableStatement
  | FunctionStatement
  | TypeChangeExpression
  | DictParsed

export interface AccessVariableExpression {
  type: 'AccessVariableExpression'
  name: string
}

export interface CallFunctionExpression {
  type: 'CallFunctionExpression'
  what: ReturnsValue
  params: ReturnsValue[]
}

export interface ArithmeticOperator {
  type: 'ArithmeticOperator'
  left: ReturnsValue
  operator: '+' | '-' | '*' | '/' | '%'
  right: ReturnsValue
}

export interface UnaryOperator {
  type: 'UnaryOperator'
  value: ReturnsValue
  operator: '++' | '--' | '!' | '+' | '-'
  location: 'left' | 'right'
}

export interface LogicalOperator {
  type: 'LogicalOperator'
  left: ReturnsValue
  operator: '==' | '!=' | '&&' | '||' | '<' | '<=' | '>' | '>='
  right: ReturnsValue
}

export interface BinaryOperator {
  type: 'BinaryOperator'
  left: ReturnsValue
  operator: '^' | '&' | '|'
  right: ReturnsValue
}

export interface AccessDotExpression {
  type: 'AccessDotExpression'
  left:
    | AccessVariableExpression
    | CallFunctionExpression
    | AccessWithArrayLikeExpression
  right:
    | AccessVariableExpression
    | CallFunctionExpression
    | AccessDotExpression
    | AccessWithArrayLikeExpression
  returnNull: boolean
}

export interface AccessWithArrayLikeExpression {
  type: 'AccessWithArrayLikeExpression'
  left: AccessVariableExpression | CallFunctionExpression | AccessDotExpression
  right: ReturnsValue
}

export interface TypeChangeExpression {
  type: 'TypeChangeExpression'
  value: ReturnsValue
  toType: Types[]
  returnNull: boolean
}

export interface StringParsed {
  type: 'StringParsed'
  value: string
}

export interface NumberParsed {
  type: 'NumberParsed'
  value: number
}

export interface BooleanParsed {
  type: 'BooleanParsed'
  value: boolean
}

export interface NullParsed {
  type: 'NullParsed'
}

export interface ArrayParsed {
  type: 'ArrayParsed'
  elements: ReturnsValue[]
}

export interface DictElement {
  name: string
  value: ReturnsValue
}

export interface DictParsed {
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

export interface Types {
  type: 'Types'
  value: TypeValues | ReturnsValue
  arrayLength?: number
}

export interface InitializeVariableStatement {
  type: 'InitializeVariableStatement'
  const: boolean
  name: string
  variableType?: Types[]
  value?: ReturnsValue
  export?: boolean
}

export interface AssignVariableStatement {
  type: 'AssignVariableStatement'
  target:
    | AccessDotExpression
    | AccessVariableExpression
    | CallFunctionExpression
    | AccessWithArrayLikeExpression
  operator: string
  value: ReturnsValue
  export?: boolean
}

export interface FunctionParameter {
  name: string
  returnType: Types[]
  default?: ReturnsValue
}

export interface BlockStatement {
  body: Node[]
}

export interface FunctionStatement extends BlockStatement {
  type: 'FunctionStatement'
  name?: string
  params: FunctionParameter[]
  returnType: Types[]
  export?: boolean
}

export interface InterfaceElements {
  name: string
  returnType: Types[]
}

export interface InterfaceStatement {
  type: 'InterfaceStatement'
  name: string
  elements: InterfaceElements[]
}

export interface ImportStatement {
  type: 'ImportStatement'
  what: string[]
  from: string
}

export interface ExportStatement {
  type: 'ExportStatement'
  what: string[]
  from?: string
}

export interface ClassStatement {
  type: 'ClassStatement'
  name: string
  extends?: AccessDotExpression | AccessVariableExpression
  implements?: AccessDotExpression | AccessVariableExpression
  properties: InitializeVariableStatement[]
  methods: FunctionStatement[]
  initializer?: FunctionStatement
}

export interface ForStatement extends BlockStatement {
  type: 'ForStatement'
  variable: InitializeVariableStatement
  condition: ReturnsValue
  increment: ReturnsValue
}

export interface WhileStatement extends BlockStatement {
  type: 'WhileStatement'
  condition: ReturnsValue
}

export interface ConditionStatement extends BlockStatement {
  type: 'ConditionStatement'
  condition?: ReturnsValue
  elseBody?: ConditionStatement
}

export interface ReturnStatement {
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

export interface GlobalBlockStatement {
  type: 'GlobalBlockStatement'
  body: GlobalNode[]
}
