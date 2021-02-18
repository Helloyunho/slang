import { TokenType } from '../lexer.ts'
import { Base } from './base.ts'
import {
  AccessDotExpression,
  AccessVariableExpression,
  AccessWithArrayLikeExpression,
  AssignVariableStatement,
  BlockStatement,
  CallFunctionExpression,
  ClassStatement,
  ConditionStatement,
  ExportStatement,
  ForStatement,
  FunctionParameter,
  FunctionStatement,
  GlobalBlockStatement,
  GlobalNode,
  ImportStatement,
  InitializeVariableStatement,
  InterfaceElements,
  InterfaceStatement,
  Node,
  ReturnStatement,
  ReturnsValue,
  Types,
  WhileStatement
} from './types.ts'

export class Statements extends Base {
  initializeVariableStatement(): InitializeVariableStatement {
    const isConst =
      this.AST.checkToken({
        type: TokenType.Keyword,
        value: ['let', 'const']
      }).value === 'const'

    const name = this.AST.checkToken({
      type: TokenType.Word
    }).value

    let type: Types[] | undefined
    if (
      this.AST.checkToken({
        type: TokenType.AssignmentOperator,
        value: ':=',
        raiseError: false
      }) === undefined
    ) {
      this.AST.checkToken({
        type: TokenType.Operator,
        value: ':'
      })
      type = this.AST.getTypes()
    }

    let value: undefined | ReturnsValue
    if (
      this.AST.checkToken({
        type: TokenType.AssignmentOperator,
        value: '=',
        raiseError: false
      }) !== undefined
    ) {
      value = this.AST.getReturnsValue()
    }

    const result: InitializeVariableStatement = {
      type: 'InitializeVariableStatement',
      const: isConst,
      name,
      variableType: type,
      value
    }

    return result
  }

  assignVariable(
    upAST?:
      | AccessDotExpression
      | AccessVariableExpression
      | CallFunctionExpression
      | AccessWithArrayLikeExpression
  ): AssignVariableStatement {
    const target = upAST ?? this.AST.expressions.accessExpression()

    const operator = this.AST.checkToken({
      type: TokenType.AssignmentOperator
    }).value

    const value = this.AST.getReturnsValue()

    const result: AssignVariableStatement = {
      type: 'AssignVariableStatement',
      target,
      value,
      operator
    }

    return result
  }

  functionStatement(nameRequired: boolean = false): FunctionStatement {
    this.AST.checkToken({
      type: TokenType.Keyword,
      value: 'func'
    })

    const name = this.AST.checkToken({
      type: TokenType.Word,
      raiseError: false
    })?.value
    if (nameRequired && name === undefined) {
      const errorToken = this.AST.getToken({})
      this.AST.error(
        'Name is required in function.',
        errorToken?.line ?? 0,
        errorToken?.col ?? 0
      )
    }

    this.AST.checkToken({
      type: TokenType.Parenthesis,
      value: '('
    })

    const params: FunctionParameter[] = []
    while (
      this.AST.checkToken({
        type: TokenType.Parenthesis,
        value: ')',
        raiseError: false
      }) === undefined
    ) {
      const paramName = this.AST.checkToken({
        type: TokenType.Word
      }).value

      this.AST.checkToken({
        type: TokenType.Operator,
        value: ':'
      })
      const paramType = this.AST.getTypes()

      let defaultValue: ReturnsValue | undefined
      if (
        this.AST.checkToken({
          type: TokenType.AssignmentOperator,
          value: '=',
          raiseError: false
        }) !== undefined
      ) {
        defaultValue = this.AST.getReturnsValue()
      }

      const paramResult: FunctionParameter = {
        name: paramName,
        returnType: paramType,
        default: defaultValue
      }

      params.push(paramResult)

      this.AST.checkToken({
        type: TokenType.Operator,
        value: ',',
        raiseError: false
      })
    }

    this.AST.checkToken({
      type: TokenType.Operator,
      value: ':'
    })
    const returnType = this.AST.getTypes()

    const { body } = this.blockStatement()

    const result: FunctionStatement = {
      type: 'FunctionStatement',
      name,
      body,
      params,
      returnType
    }

    return result
  }

  interfaceStatement(): InterfaceStatement {
    this.AST.checkToken({
      type: TokenType.Keyword,
      value: 'interface'
    })

    const name = this.AST.checkToken({
      type: TokenType.Word
    }).value

    const elements: InterfaceElements[] = []
    this.AST.checkToken({
      type: TokenType.Braces,
      value: '{'
    })
    while (
      this.AST.checkToken({
        type: TokenType.Braces,
        value: '}',
        raiseError: false
      }) === undefined
    ) {
      const elementName = this.AST.checkToken({
        type: TokenType.Word
      }).value

      this.AST.checkToken({
        type: TokenType.Operator,
        value: ':'
      })
      const elementType = this.AST.getTypes()

      const element: InterfaceElements = {
        name: elementName,
        returnType: elementType
      }

      elements.push(element)

      this.AST.checkToken({
        type: TokenType.Operator,
        value: ',',
        raiseError: false
      })
    }

    const result: InterfaceStatement = {
      type: 'InterfaceStatement',
      name,
      elements
    }

    return result
  }

  whileStatement(): WhileStatement {
    this.AST.checkToken({
      type: TokenType.Keyword,
      value: 'while'
    })

    this.AST.checkToken({
      type: TokenType.Parenthesis,
      value: '('
    })
    const condition = this.AST.getReturnsValue()
    this.AST.checkToken({
      type: TokenType.Parenthesis,
      value: ')'
    })

    const { body } = this.blockStatement()

    const result: WhileStatement = {
      type: 'WhileStatement',
      condition,
      body
    }

    return result
  }

  conditionStatement(): ConditionStatement {
    this.AST.checkToken({
      type: TokenType.Keyword,
      value: 'if'
    })

    this.AST.checkToken({
      type: TokenType.Parenthesis,
      value: '('
    })
    const condition = this.AST.getReturnsValue()
    this.AST.checkToken({
      type: TokenType.Parenthesis,
      value: ')'
    })

    const { body } = this.blockStatement()

    let elseBody: undefined | ConditionStatement
    if (
      this.AST.checkToken({
        type: TokenType.Keyword,
        value: 'else',
        raiseError: false
      }) !== undefined
    ) {
      if (
        this.AST.checkToken({
          type: TokenType.Keyword,
          value: 'if',
          raiseError: false,
          addToIndex: false
        }) !== undefined
      ) {
        elseBody = this.conditionStatement()
      } else {
        elseBody = {
          type: 'ConditionStatement',
          body: this.blockStatement().body
        }
      }
    }

    const result: ConditionStatement = {
      type: 'ConditionStatement',
      condition,
      body,
      elseBody
    }

    return result
  }

  forStatement(): ForStatement {
    this.AST.checkToken({
      type: TokenType.Keyword,
      value: 'for'
    })

    this.AST.checkToken({
      type: TokenType.Parenthesis,
      value: '('
    })
    const variable = this.initializeVariableStatement()
    this.AST.checkToken({
      type: TokenType.Operator,
      value: ','
    })
    const condition = this.AST.getReturnsValue()
    this.AST.checkToken({
      type: TokenType.Operator,
      value: ','
    })
    const increment = this.AST.getReturnsValue()
    this.AST.checkToken({
      type: TokenType.Parenthesis,
      value: ')'
    })

    const { body } = this.blockStatement()

    const result: ForStatement = {
      type: 'ForStatement',
      variable,
      condition,
      increment,
      body
    }

    return result
  }
  classStatement(): ClassStatement {
    this.AST.checkToken({
      type: TokenType.Keyword,
      value: 'class'
    })

    const name = this.AST.checkToken({
      type: TokenType.Word
    }).value

    let extend: undefined | AccessDotExpression | AccessVariableExpression
    if (
      this.AST.checkToken({
        type: TokenType.Keyword,
        value: 'extends',
        raiseError: false
      })
    ) {
      const result = this.AST.expressions.accessExpression()
      if (
        result.type !== 'AccessWithArrayLikeExpression' &&
        result.type !== 'CallFunctionExpression'
      ) {
        extend = result
      } else {
        const errorToken = this.AST.getToken({})
        this.AST.error(
          `Functions or array-like accessor cannot used to extend class.`,
          errorToken?.line ?? 0,
          errorToken?.col ?? 0
        )
      }
    }

    let implement: undefined | AccessDotExpression | AccessVariableExpression
    if (
      this.AST.checkToken({
        type: TokenType.Keyword,
        value: 'implements',
        raiseError: false
      })
    ) {
      const result = this.AST.expressions.accessExpression()
      if (
        result.type !== 'AccessWithArrayLikeExpression' &&
        result.type !== 'CallFunctionExpression'
      ) {
        implement = result
      } else {
        const errorToken = this.AST.getToken({})
        this.AST.error(
          `Functions or array-like accessor cannot used to implement class.`,
          errorToken?.line ?? 0,
          errorToken?.col ?? 0
        )
      }
    }

    this.AST.checkToken({
      type: TokenType.Braces,
      value: '{'
    })
    const properties: InitializeVariableStatement[] = []
    const methods: FunctionStatement[] = []
    let initializer: undefined | FunctionStatement
    while (
      this.AST.checkToken({
        type: TokenType.Braces,
        value: '}',
        raiseError: false
      }) === undefined
    ) {
      if (
        this.AST.checkToken({
          type: TokenType.Keyword,
          value: ['const', 'let'],
          raiseError: false,
          addToIndex: false
        }) !== undefined
      ) {
        properties.push(this.initializeVariableStatement())
      } else {
        const func = this.functionStatement()
        if (func.name === 'init') {
          initializer = func
        } else {
          methods.push(func)
        }
      }
    }

    const result: ClassStatement = {
      type: 'ClassStatement',
      name,
      extends: extend,
      implements: implement,
      properties,
      methods,
      initializer
    }

    return result
  }

  blockStatement(useForGlobalBlock: boolean = false): BlockStatement {
    const body: Node[] = []

    if (!useForGlobalBlock) {
      this.AST.checkToken({
        type: TokenType.Braces,
        value: '{'
      })
    }

    let token = this.AST.getToken({})
    while (
      token !== undefined &&
      token.type !== TokenType.Braces &&
      token.value !== '}'
    ) {
      if (token.type === TokenType.Keyword) {
        if (['let', 'const'].includes(token.value)) {
          body.push(this.initializeVariableStatement())
          break
        } else if (token.value === 'return') {
          this.AST.checkToken({
            type: TokenType.Keyword,
            value: 'return'
          })
          const result: ReturnStatement = {
            type: 'ReturnStatement',
            value: this.AST.getReturnsValue()
          }
          body.push(result)
        } else if (token.value === 'interface') {
          body.push(this.interfaceStatement())
          break
        } else if (token.value === 'while') {
          body.push(this.whileStatement())
          break
        } else if (token.value === 'if') {
          body.push(this.conditionStatement())
          break
        } else if (token.value === 'for') {
          body.push(this.forStatement())
          break
        } else if (token.value === 'class') {
          body.push(this.classStatement())
          break
        }
      }

      const returns = this.AST.getReturnsValue(false)
      if (returns !== undefined) {
        body.push(returns)
      }

      token = this.AST.getToken({})
    }

    if (!useForGlobalBlock) {
      this.AST.checkToken({
        type: TokenType.Braces,
        value: '}'
      })
    }

    const result: BlockStatement = {
      body
    }

    return result
  }

  globalBlockStatement(): GlobalBlockStatement {
    const body: GlobalNode[] = []

    let token = this.AST.getToken({})
    while (token !== undefined) {
      if (token.type === TokenType.Keyword) {
        if (token.value === 'import') {
          this.AST.checkToken({
            type: TokenType.Keyword,
            value: 'import'
          })

          const what: string[] = [
            this.AST.checkToken({
              type: TokenType.Word
            }).value
          ]
          while (
            this.AST.checkToken({
              type: TokenType.Operator,
              value: ',',
              raiseError: false
            }) !== undefined
          ) {
            what.push(
              this.AST.checkToken({
                type: TokenType.Word
              }).value
            )
          }

          this.AST.checkToken({
            type: TokenType.Word,
            value: 'from'
          })
          const from = this.AST.checkToken({
            type: TokenType.String
          }).value

          const result: ImportStatement = {
            type: 'ImportStatement',
            what,
            from
          }

          body.push(result)
        } else if (token.value === 'export') {
          this.AST.checkToken({
            type: TokenType.Keyword,
            value: 'export'
          })

          const what: string[] = [
            this.AST.checkToken({
              type: TokenType.Word
            }).value
          ]
          while (
            this.AST.checkToken({
              type: TokenType.Operator,
              value: ',',
              raiseError: false
            }) !== undefined
          ) {
            what.push(
              this.AST.checkToken({
                type: TokenType.Word
              }).value
            )
          }

          let from: undefined | string
          if (
            this.AST.checkToken({
              type: TokenType.Word,
              value: 'from',
              raiseError: false
            }) !== undefined
          ) {
            from = this.AST.checkToken({
              type: TokenType.String
            }).value
          }

          const result: ExportStatement = {
            type: 'ExportStatement',
            what,
            from
          }

          body.push(result)
        }
      }

      body.push(...this.blockStatement(true).body)
      token = this.AST.getToken({})
    }

    const result: GlobalBlockStatement = {
      type: 'GlobalBlockStatement',
      body
    }

    return result
  }
}
