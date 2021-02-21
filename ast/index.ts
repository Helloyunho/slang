import { Position, Token, TokenType } from '../lexer.ts'
import { Expressions } from './expressions.ts'
import { Operators } from './operators.ts'
import { Statements } from './statements.ts'
import { ReturnsValue, Types, TypeValues } from './types.ts'
import { ValueParsers } from './valueParsers.ts'

export class ASTError extends Error {
  constructor(public msg: string, public line: number, public col: number) {
    super(`${msg} at ${line}:${col}`)
  }
}

export class AST {
  errors: ASTError[] = []
  tokens: Token[]
  tokenIndex: number = 0
  expressions: Expressions
  operators: Operators
  statements: Statements
  valueParsers: ValueParsers

  constructor(tokens: Token[]) {
    this.tokens = tokens
    this.expressions = new Expressions(this)
    this.operators = new Operators(this)
    this.statements = new Statements(this)
    this.valueParsers = new ValueParsers(this)
  }

  error(msg: string, line: number, col: number): void {
    // this.errors.push(new ASTError(msg, line, col))
    // This for better debugging
    throw new ASTError(msg, line, col)
  }

  reset() {
    this.errors = []
    this.tokenIndex = 0
  }

  getToken({
    offset = 0,
    addToIndex = false
  }: {
    offset?: number
    addToIndex?: boolean
  }): Token | undefined {
    const token = this.tokens[this.tokenIndex + offset]

    if (addToIndex) {
      this.tokenIndex += offset !== 0 ? offset + 1 : 1
    }
    return token
  }

  checkToken({
    type,
    value,
    raiseError,
    addToIndex,
    offset
  }: {
    type?: TokenType | TokenType[]
    value?: string | string[]
    raiseError?: true
    addToIndex?: boolean
    offset?: number
  }): Token
  checkToken({
    type,
    value,
    raiseError,
    addToIndex,
    offset
  }: {
    type?: TokenType | TokenType[]
    value?: string | string[]
    raiseError: false
    addToIndex?: boolean
    offset?: number
  }): Token | undefined
  checkToken({
    type,
    value,
    raiseError = true,
    addToIndex = true,
    offset = 0
  }: {
    type?: TokenType | TokenType[]
    value?: string | string[]
    raiseError?: boolean
    addToIndex?: boolean
    offset?: number
  }): Token | undefined {
    const token = this.getToken({
      offset
    })

    if (token !== undefined) {
      if (token.type === TokenType.NewLine) {
        if (raiseError) {
          return this.checkToken({
            type,
            value,
            raiseError: true,
            addToIndex,
            offset: offset + 1
          })
        } else {
          return this.checkToken({
            type,
            value,
            raiseError: false,
            addToIndex,
            offset: offset + 1
          })
        }
      }
      if (
        (type !== undefined
          ? type instanceof Array
            ? type.includes(token.type)
            : token.type === type
          : true) &&
        (value !== undefined
          ? value instanceof Array
            ? value.includes(token.value)
            : token.value === value
          : true)
      ) {
        if (addToIndex) {
          this.tokenIndex += offset !== 0 ? offset + 1 : 1
        }
        return token
      } else {
        if (raiseError) {
          this.error(
            `Unexpected syntax ${token.value}`,
            token.start.line,
            token.start.col
          )
        } else {
          return undefined
        }
      }
    } else {
      if (raiseError) {
        const lastToken = this.tokens[this.tokens.length - 1]
        this.error(`Unexpected EOF`, lastToken.start.line, lastToken.start.col)
      } else {
        return undefined
      }
    }
  }

  getTypes(): Array<Types> {
    const types: Array<Types> = []

    const withBracket =
      this.checkToken({
        type: TokenType.Parenthesis,
        value: '(',
        raiseError: false
      }) !== undefined

    const getType = () => {
      let type: TypeValues | ReturnsValue
      let start: Position
      let end: Position
      const typeToken = this.checkToken({
        type: TokenType.Type,
        raiseError: false
      })
      if (typeToken !== undefined) {
        type = typeToken.value as TypeValues
        start = typeToken.start
        end = typeToken.end
      } else {
        type = this.getReturnsValue(true, [
          'AssignVariableStatement',
          'ArithmeticOperator',
          'BinaryOperator',
          'UnaryOperator',
          'LogicalOperator',
          'ArrayParsed',
          'AccessWithArrayLikeExpression'
        ])
        start = type.start
        end = type.end
      }

      let arrayLength: undefined | number
      if (
        this.checkToken({
          type: TokenType.SqBraces,
          value: '[',
          raiseError: false
        }) !== undefined
      ) {
        arrayLength = Number(
          this.checkToken({
            type: TokenType.Number,
            raiseError: false
          })?.value ?? Infinity
        )

        end = this.checkToken({
          type: TokenType.SqBraces,
          value: ']'
        }).end
      }

      const result: Types = {
        type: 'Types',
        value: type,
        arrayLength,
        start,
        end
      }

      types.push(result)
    }

    getType()
    while (
      this.checkToken({
        type: TokenType.BinaryOperator,
        value: '|',
        raiseError: false
      }) !== undefined
    ) {
      getType()
    }

    if (withBracket) {
      this.checkToken({
        type: TokenType.Parenthesis,
        value: ')'
      })
    }

    return types
  }

  getReturnsValue(
    raiseError?: true,
    skipTokenType?: ReturnsValue['type'][],
    upAST?: ReturnsValue
  ): ReturnsValue
  getReturnsValue(
    raiseError: false,
    skipTokenType?: ReturnsValue['type'][],
    upAST?: ReturnsValue
  ): ReturnsValue | undefined
  getReturnsValue(
    raiseError: boolean = true,
    skipTokenType: ReturnsValue['type'][] = [],
    upAST?: ReturnsValue
  ): ReturnsValue | undefined {
    const currentToken = this.getToken({})

    if (
      currentToken?.type === TokenType.NewLine ||
      (currentToken?.type === TokenType.Operator && currentToken.value === ';')
    ) {
      this.tokenIndex++
      return upAST
    } else if (
      currentToken?.type === TokenType.Parenthesis &&
      currentToken.value === '('
    ) {
      // #region CallFunctionExpression or override
      if (
        !skipTokenType.includes('CallFunctionExpression') &&
        (upAST?.type === 'CallFunctionExpression' ||
          upAST?.type === 'AccessDotExpression' ||
          upAST?.type === 'Identifier' ||
          upAST?.type === 'AccessWithArrayLikeExpression')
      ) {
        upAST = this.expressions.callFunctionExpression(upAST)
      } else {
        this.checkToken({
          type: TokenType.Parenthesis,
          value: '('
        })
        upAST = this.getReturnsValue(true, [], upAST)
        this.checkToken({
          type: TokenType.Parenthesis,
          value: ')'
        })
      }
      // #endregion
    } else if (
      !skipTokenType.includes('ArithmeticOperator') &&
      currentToken?.type === TokenType.ArithmeticOperator
    ) {
      // #region ArithmeticOperator
      upAST = this.operators.arithmeticOperator(upAST)
      // #endregion
    } else if (
      !skipTokenType.includes('AssignVariableStatement') &&
      currentToken?.type === TokenType.AssignmentOperator
    ) {
      // #region AssignVariableStatement
      if (
        upAST?.type === 'CallFunctionExpression' ||
        upAST?.type === 'AccessDotExpression' ||
        upAST?.type === 'Identifier' ||
        upAST?.type === 'AccessWithArrayLikeExpression'
      ) {
        upAST = this.statements.assignVariable(upAST)
      } else {
        upAST = this.statements.assignVariable()
      }
      // #endregion
    } else if (
      !skipTokenType.includes('LogicalOperator') &&
      currentToken?.type === TokenType.LogicalOperator
    ) {
      // #region LogicalOperator
      upAST = this.operators.logicalOperator(upAST)
      // #endregion
    } else if (
      !skipTokenType.includes('BinaryOperator') &&
      currentToken?.type === TokenType.BinaryOperator
    ) {
      // #region BinaryOperator
      upAST = this.operators.binaryOperator(upAST)
      // #endregion
    } else if (
      !skipTokenType.includes('UnaryOperator') &&
      currentToken?.type === TokenType.UnaryOperator
    ) {
      // #region UnaryOperator
      upAST = this.operators.unaryOperator(upAST)
      // #endregion
    } else if (
      (!skipTokenType.includes('AccessDotExpression') ||
        !skipTokenType.includes('Identifier') ||
        !skipTokenType.includes('CallFunctionExpression')) &&
      currentToken?.type === TokenType.Word
    ) {
      // #region AccessExpressions
      const result = this.expressions.accessExpression()
      if (!skipTokenType.includes(result.type)) {
        upAST = result
      } else {
        if (raiseError) {
          this.error(
            `Unexpected syntax ${currentToken.value}`,
            currentToken.start.line ?? 0,
            currentToken.start.col ?? 0
          )
        } else {
          return upAST
        }
      }
      // #endregion
    } else if (
      !skipTokenType.includes('StringParsed') &&
      currentToken?.type === TokenType.String &&
      upAST === undefined
    ) {
      // #region String
      upAST = this.valueParsers.stringParser()
      // #endregion
    } else if (
      !skipTokenType.includes('NumberParsed') &&
      currentToken?.type === TokenType.Number &&
      upAST === undefined
    ) {
      // #region Number
      upAST = this.valueParsers.numberParser()
      // #endregion
    } else if (
      (!skipTokenType.includes('AccessWithArrayLikeExpression') ||
        !skipTokenType.includes('ArrayParsed')) &&
      currentToken?.type === TokenType.SqBraces &&
      currentToken?.value === '['
    ) {
      // #region ArrayLikeExpression or Array
      if (
        !skipTokenType.includes('AccessWithArrayLikeExpression') &&
        (upAST?.type === 'AccessDotExpression' ||
          upAST?.type === 'Identifier' ||
          upAST?.type === 'CallFunctionExpression')
      ) {
        upAST = this.expressions.accessWithArrayLikeExpression(upAST)
      } else if (
        !skipTokenType.includes('ArrayParsed') &&
        upAST === undefined
      ) {
        upAST = this.valueParsers.arrayParser()
      }
      // #endregion
    } else if (
      !skipTokenType.includes('DictParsed') &&
      currentToken?.type === TokenType.Braces &&
      currentToken?.value === '{' &&
      upAST === undefined
    ) {
      // #region Dict
      upAST = this.valueParsers.dictParser()
      // #endregion
    } else if (
      (!skipTokenType.includes('BooleanParsed') ||
        !skipTokenType.includes('FunctionStatement') ||
        !skipTokenType.includes('TypeChangeExpression')) &&
      currentToken?.type === TokenType.Keyword
    ) {
      // #region Keywords
      if (
        !skipTokenType.includes('BooleanParsed') &&
        ['true', 'false'].includes(currentToken.value) &&
        upAST === undefined
      ) {
        // #region Boolean
        upAST = this.valueParsers.booleanParser()
        // #endregion
      } else if (
        !skipTokenType.includes('FunctionStatement') &&
        currentToken.value === 'func' &&
        upAST === undefined
      ) {
        // #region Function
        upAST = this.statements.functionStatement()
        return upAST
        // #endregion
      } else if (
        !skipTokenType.includes('TypeChangeExpression') &&
        currentToken.value === 'as'
      ) {
        // #region TypeChangeExpression
        upAST = this.expressions.typeChangeExpression(upAST)
        // #endregion
      } else {
        if (raiseError) {
          this.error(
            `Unexpected syntax ${currentToken.value}`,
            currentToken.start.line ?? 0,
            currentToken.start.col ?? 0
          )
        } else {
          return upAST
        }
      }
      // #endregion
    } else if (
      !skipTokenType.includes('NullParsed') &&
      currentToken?.type === TokenType.Type &&
      currentToken.value === 'null' &&
      upAST === undefined
    ) {
      // #region Null
      upAST = this.valueParsers.nullParser()
      // #endregion
    } else {
      if (raiseError) {
        this.error(
          `Unexpected syntax ${currentToken?.value}`,
          currentToken?.start.line ?? 0,
          currentToken?.start.col ?? 0
        )
      } else {
        return upAST
      }
    }

    // Check for new line or semi
    const testToken = this.getToken({ offset: -1 })
    if (
      testToken?.type === TokenType.NewLine ||
      (testToken?.type === TokenType.Operator && testToken.value === ';')
    ) {
      return upAST
    } else {
      return this.getReturnsValue(false, skipTokenType, upAST)
    }
  }
}
