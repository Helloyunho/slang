import { Token, TokenType } from './lexer.ts'

export enum NodeType {
  Variable,
  Function,
  Import,
  Class,
  For,
  While,
  Condition
}

export type Expression =
  | CallFunctionExpression
  | ArithmeticOperator
  | LogicalOperator
  | BinaryOperator
  | AccessVariableExpression

export interface AccessVariableExpression {
  name: string
}

export interface CallFunctionExpression {
  name: string
  args: Expression[]
}

export interface ArithmeticOperator {
  left: Expression
  operator: string
  right: Expression
}

export interface LogicalOperator {
  left: Expression
  operator: string
  right: Expression
}

export interface BinaryOperator {
  left: Expression
  operator: string
  right: Expression
}

export interface AccessDotExpression {
  left: AccessVariableExpression | CallFunctionExpression
  right: AccessVariableExpression | CallFunctionExpression
  returnNull: boolean
}

export type Types =
  | 'void'
  | 'i32'
  | 'i64'
  | 'u32'
  | 'u64'
  | 'str'
  | 'char'
  | 'bool'
  | 'null'

export interface VariableStatement {
  const: boolean
  name: string
  type: Types
  operator: string
  value: Expression
  export?: boolean
}

export interface FunctionParameter {
  name: string
  type: Types
  default: Expression
}

export interface BlockStatement {
  body: Node[]
}

export interface FunctionStatement {
  name: string
  params: FunctionParameter[]
  returnType: Types
  body: BlockStatement
  export?: boolean
}

export interface ImportStatement {
  what: string[]
  from: string
}

export interface ClassStatement {
  name: string
  extends?: string
  implements?: string
  properties: VariableStatement[]
  methods: FunctionStatement[]
  initializer?: FunctionStatement
}

export interface ForStatement {
  variable: VariableStatement
  condition: Expression
  increment: Expression
}

export interface WhileStatement {
  condition: Expression
}

export interface ConditionStatement {
  condition: Expression | 'else'
  body: BlockStatement
  elseBody: ConditionStatement
}

export interface Node {
  type: NodeType
  variable?: VariableStatement
  function?: FunctionStatement
  class?: ClassStatement
  while?: WhileStatement
  conditions?: ConditionStatement[]
}

export enum StateType {
  None,
  Variable,
  Function,
  Class,
  Import,
  For,
  While,
  Conditions
}

export class ASTState {
  ast: AST
  type: StateType = StateType.None
  tokens: Token[] = []
  data: any

  constructor(ast: AST) {
    this.ast = ast
  }

  reset() {
    this.type = StateType.None
    this.tokens = []
    this.data = {}
  }

  start(type: StateType) {
    this.reset()
    this.type = type
  }
}

export class ASTError {
  constructor(public msg: string, public line: number, public col: number) {}
}

export class AST {
  state: ASTState
  nodes: Node[] = []
  errors: ASTError[] = []
  tokens: Token[]
  tokenIndex: number = 0

  constructor(tokens: Token[]) {
    this.tokens = tokens
    this.state = new ASTState(this)
  }

  push(node: Node) {
    this.nodes.push(node)
  }

  error(msg: string, line: number, col: number) {
    this.errors.push(new ASTError(msg, line, col))
  }

  reset() {
    this.state.reset()
    this.nodes = []
    this.errors = []
  }

  output() {
    const data = {
      nodes: this.nodes,
      errors: this.errors
    }

    this.reset()
    return data
  }

  parse() {
    this.reset()

    let idx = 0
    while (idx < tokens.length) {
      const getToken = (offset: number = 0, addToIndex: boolean = false) => {
        if (addToIndex) {
          idx += offset
        }
        return tokens[idx + offset]
      }

      switch (getToken().type) {
        case TokenType.Word: {
          const getResult = () => {
            const value: AccessVariableExpression = {
              name: getToken().value
            }

            if (getToken(1).value === '.') {
              idx++
              let returnNull = false
              if (getToken(1).value === '?') {
                returnNull = true
                idx++
              }
            } else if (getToken(1).value === '(') {
              idx++
            } else {
              return value
            }
          }
          break
        }
      }
      // man this is confusing
      // yes
      idx++
    }

    return this.output()
  }
}
