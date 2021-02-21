import { Position, TokenType } from '../lexer.ts'
import { Base } from './base.ts'
import {
  AccessDotExpression,
  Identifier,
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
  WhileStatement,
  StringParsed
} from './types.ts'

export class Statements extends Base {
  initializeVariableStatement(): InitializeVariableStatement {
    const initializerToken = this.AST.checkToken({
      type: TokenType.Keyword,
      value: ['let', 'const']
    })
    const isConst = initializerToken.value === 'const'

    const name = this.AST.expressions.identifierExpression()

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
        value: ['=', ':='],
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
      value,
      start: initializerToken.start,
      end:
        value !== undefined
          ? value.end
          : type !== undefined
          ? type[type.length - 1].end
          : name.end
    }

    return result
  }

  assignVariable(
    upAST?:
      | AccessDotExpression
      | Identifier
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
      operator,
      start: target.start,
      end: value.end
    }

    return result
  }

  functionStatement(nameRequired: boolean = false): FunctionStatement {
    const { start } = this.AST.checkToken({
      type: TokenType.Keyword,
      value: 'func'
    })

    let name: Identifier | undefined
    if (
      this.AST.checkToken({
        type: TokenType.Word,
        addToIndex: false,
        raiseError: false
      }) !== undefined
    ) {
      name = this.AST.expressions.identifierExpression()
    } else {
      if (nameRequired) {
        const errorToken = this.AST.getToken({})
        this.AST.error(
          'Name is required in function.',
          errorToken?.start.line ?? 0,
          errorToken?.start.col ?? 0
        )
      }
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
      const paramName = this.AST.expressions.identifierExpression()

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
        default: defaultValue,
        start: paramName.start,
        end:
          defaultValue !== undefined
            ? defaultValue.end
            : paramType[paramType.length - 1].end
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

    const block = this.blockStatement()

    const result: FunctionStatement = {
      type: 'FunctionStatement',
      name,
      block,
      params,
      returnType,
      start,
      end: block.end
    }

    return result
  }

  interfaceStatement(): InterfaceStatement {
    const { start } = this.AST.checkToken({
      type: TokenType.Keyword,
      value: 'interface'
    })

    const name = this.AST.expressions.identifierExpression()

    const elements: InterfaceElements[] = []
    this.AST.checkToken({
      type: TokenType.Braces,
      value: '{'
    })
    let end
    while (
      (end = this.AST.checkToken({
        type: TokenType.Braces,
        value: '}',
        raiseError: false
      })?.end) === undefined
    ) {
      const elementName = this.AST.expressions.identifierExpression()

      this.AST.checkToken({
        type: TokenType.Operator,
        value: ':'
      })
      const elementType = this.AST.getTypes()

      const element: InterfaceElements = {
        name: elementName,
        returnType: elementType,
        start: elementName.start,
        end: elementType[elementType.length - 1].end
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
      elements,
      start,
      end
    }

    return result
  }

  whileStatement(): WhileStatement {
    const { start } = this.AST.checkToken({
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

    const block = this.blockStatement()

    const result: WhileStatement = {
      type: 'WhileStatement',
      condition,
      block,
      start,
      end: block.end
    }

    return result
  }

  conditionStatement(): ConditionStatement {
    const { start } = this.AST.checkToken({
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

    const block = this.blockStatement()

    let elseBody: undefined | ConditionStatement
    if (
      this.AST.checkToken({
        type: TokenType.Keyword,
        value: 'else',
        addToIndex: false,
        raiseError: false
      }) !== undefined
    ) {
      const elseToken = this.AST.checkToken({
        type: TokenType.Keyword,
        value: 'else'
      })
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
        const block = this.blockStatement()
        elseBody = {
          type: 'ConditionStatement',
          block,
          start: elseToken.start,
          end: block.end
        }
      }
    }

    const result: ConditionStatement = {
      type: 'ConditionStatement',
      condition,
      block,
      elseBody,
      start,
      end: elseBody !== undefined ? elseBody.end : block.end
    }

    return result
  }

  forStatement(): ForStatement {
    const { start } = this.AST.checkToken({
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

    const block = this.blockStatement()

    const result: ForStatement = {
      type: 'ForStatement',
      variable,
      condition,
      increment,
      block,
      start,
      end: block.end
    }

    return result
  }

  classStatement(): ClassStatement {
    const { start } = this.AST.checkToken({
      type: TokenType.Keyword,
      value: 'class'
    })

    const name = this.AST.expressions.identifierExpression()

    let extend: undefined | AccessDotExpression | Identifier
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
          errorToken?.start.line ?? 0,
          errorToken?.start.col ?? 0
        )
      }
    }

    let implement: undefined | AccessDotExpression | Identifier
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
          errorToken?.start.line ?? 0,
          errorToken?.start.col ?? 0
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
    let end
    while (
      (end = this.AST.checkToken({
        type: TokenType.Braces,
        value: '}',
        raiseError: false
      })?.end) === undefined
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
        if (func.name?.name === 'init') {
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
      initializer,
      start,
      end
    }

    return result
  }

  blockStatement(useForGlobalBlock: boolean = false): BlockStatement {
    const body: Node[] = []

    let start: Position = {
      line: 0,
      col: 0
    }
    if (!useForGlobalBlock) {
      start = this.AST.checkToken({
        type: TokenType.Braces,
        value: '{'
      }).start
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
          const { start } = this.AST.checkToken({
            type: TokenType.Keyword,
            value: 'return'
          })
          const value = this.AST.getReturnsValue()
          const result: ReturnStatement = {
            type: 'ReturnStatement',
            value,
            start,
            end: value.end
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

    let end = token?.end
    if (!useForGlobalBlock) {
      end = this.AST.checkToken({
        type: TokenType.Braces,
        value: '}'
      }).end
    }
    if (end === undefined) {
      const previousToken = this.AST.getToken({
        offset: this.AST.tokenIndex - 1
      })
      end = {
        line: previousToken?.end.line ?? 0,
        col: (previousToken?.end.col ?? 0) + 1
      }
    }

    const result: BlockStatement = {
      type: 'BlockStatement',
      body,
      start,
      end
    }

    return result
  }

  globalBlockStatement(): GlobalBlockStatement {
    const body: GlobalNode[] = []

    let token = this.AST.getToken({})
    while (token !== undefined) {
      if (token.type === TokenType.Keyword) {
        if (token.value === 'import') {
          const { start } = this.AST.checkToken({
            type: TokenType.Keyword,
            value: 'import'
          })

          const what: Identifier[] = [
            this.AST.expressions.identifierExpression()
          ]
          while (
            this.AST.checkToken({
              type: TokenType.Operator,
              value: ',',
              raiseError: false
            }) !== undefined
          ) {
            what.push(this.AST.expressions.identifierExpression())
          }

          this.AST.checkToken({
            type: TokenType.Word,
            value: 'from'
          })
          const from = this.AST.valueParsers.stringParser()

          const result: ImportStatement = {
            type: 'ImportStatement',
            what,
            from,
            start,
            end: from.end
          }

          body.push(result)
        } else if (token.value === 'export') {
          const { start } = this.AST.checkToken({
            type: TokenType.Keyword,
            value: 'export'
          })

          const what: Identifier[] = [
            this.AST.expressions.identifierExpression()
          ]
          while (
            this.AST.checkToken({
              type: TokenType.Operator,
              value: ',',
              raiseError: false
            }) !== undefined
          ) {
            what.push(this.AST.expressions.identifierExpression())
          }

          let from: undefined | StringParsed
          if (
            this.AST.checkToken({
              type: TokenType.Word,
              value: 'from',
              raiseError: false
            }) !== undefined
          ) {
            from = this.AST.valueParsers.stringParser()
          }

          const result: ExportStatement = {
            type: 'ExportStatement',
            what,
            from,
            start,
            end: from !== undefined ? from.end : what[what.length - 1].end
          }

          body.push(result)
        }
      }

      body.push(...this.blockStatement(true).body)
      token = this.AST.getToken({})
    }

    const lastToken = this.AST.getToken({
      offset: -1
    })
    let end: Position
    if (lastToken !== undefined) {
      end = {
        col: lastToken.end.col + 1,
        line: lastToken.end.line
      }
    } else {
      end = {
        col: 1,
        line: 0
      }
    }

    const result: GlobalBlockStatement = {
      type: 'GlobalBlockStatement',
      body,
      start: {
        col: 0,
        line: 0
      },
      end
    }

    return result
  }
}
