import { TokenType } from '../lexer.ts'
import { Base } from './base.ts'
import {
  AccessDotExpression,
  AccessVariableExpression,
  AccessWithArrayLikeExpression,
  CallFunctionExpression,
  ReturnsValue,
  TypeChangeExpression
} from './types.ts'

export class Expressions extends Base {
  accessDotExpression(
    leftAST?:
      | AccessVariableExpression
      | CallFunctionExpression
      | AccessWithArrayLikeExpression
  ) {
    const left =
      leftAST ??
      (this.accessExpression(true) as
        | AccessVariableExpression
        | CallFunctionExpression
        | AccessWithArrayLikeExpression)
    let returnNull = false

    if (
      this.AST.checkToken({
        type: TokenType.Operator,
        value: '?.',
        raiseError: false
      }) !== undefined
    ) {
      returnNull = true
    } else {
      this.AST.checkToken({
        type: TokenType.Operator,
        value: '.'
      })
    }
    const right = this.accessExpression()

    const result: AccessDotExpression = {
      type: 'AccessDotExpression',
      left,
      returnNull,
      right
    }

    return result
  }

  accessWithArrayLikeExpression(
    leftAST?:
      | AccessVariableExpression
      | CallFunctionExpression
      | AccessDotExpression
  ) {
    const left =
      leftAST ??
      (this.accessExpression(false, true) as
        | AccessVariableExpression
        | CallFunctionExpression
        | AccessDotExpression)

    this.AST.checkToken({
      type: TokenType.SqBraces,
      value: '['
    })
    const right = this.AST.getReturnsValue()
    this.AST.checkToken({
      type: TokenType.SqBraces,
      value: ']'
    })

    const result: AccessWithArrayLikeExpression = {
      type: 'AccessWithArrayLikeExpression',
      left,
      right
    }

    return result
  }

  accessVariableExpression() {
    const name = this.AST.checkToken({
      type: TokenType.Word
    }).value

    const result: AccessVariableExpression = {
      type: 'AccessVariableExpression',
      name
    }

    return result
  }

  callFunctionExpression(
    leftAST?:
      | AccessVariableExpression
      | CallFunctionExpression
      | AccessDotExpression
      | AccessWithArrayLikeExpression
  ) {
    const what =
      leftAST ??
      (this.accessExpression(false, false, true) as
        | AccessVariableExpression
        | CallFunctionExpression
        | AccessDotExpression)

    this.AST.checkToken({
      type: TokenType.Parenthesis,
      value: '('
    })

    const params: ReturnsValue[] = []
    while (
      this.AST.checkToken({
        type: TokenType.Parenthesis,
        value: ')',
        raiseError: false
      }) === undefined
    ) {
      params.push(this.AST.getReturnsValue())
      this.AST.checkToken({
        type: TokenType.Operator,
        value: ',',
        raiseError: false
      })
    }

    const result: CallFunctionExpression = {
      type: 'CallFunctionExpression',
      what,
      params
    }

    return result
  }

  accessExpression(
    skipDotExpression = false,
    skipArrayLikeExpression = false,
    skipFunctionExpression = false
  ):
    | AccessDotExpression
    | AccessVariableExpression
    | CallFunctionExpression
    | AccessWithArrayLikeExpression {
    this.AST.checkToken({
      type: TokenType.Word,
      raiseError: false,
      addToIndex: false
    })

    if (
      !skipDotExpression &&
      this.AST.checkToken({
        type: TokenType.Operator,
        value: ['?.', '.'],
        addToIndex: false,
        raiseError: false,
        offset: 1
      }) !== undefined
    ) {
      return this.accessDotExpression()
    } else if (
      !skipFunctionExpression &&
      this.AST.checkToken({
        type: TokenType.Parenthesis,
        value: '(',
        addToIndex: false,
        raiseError: false,
        offset: 1
      }) !== undefined
    ) {
      const result = this.callFunctionExpression()

      if (
        this.AST.checkToken({
          type: TokenType.Operator,
          value: ['.', '?.'],
          raiseError: false,
          addToIndex: false
        })
      ) {
        return this.accessDotExpression(result)
      }

      return result
    } else if (
      skipArrayLikeExpression &&
      this.AST.checkToken({
        type: TokenType.SqBraces,
        value: '[',
        addToIndex: false,
        raiseError: false
      }) !== undefined
    ) {
      return this.accessWithArrayLikeExpression()
    } else {
      return this.accessVariableExpression()
    }
  }

  typeChangeExpression(upAST?: ReturnsValue): TypeChangeExpression {
    const value = upAST ?? this.AST.getReturnsValue()

    this.AST.checkToken({
      type: TokenType.Keyword,
      value: 'as'
    })

    let returnNull =
      this.AST.checkToken({
        type: TokenType.Operator,
        value: '?',
        raiseError: false
      }) !== undefined

    const toType = this.AST.getTypes()

    const result: TypeChangeExpression = {
      type: 'TypeChangeExpression',
      value,
      toType,
      returnNull
    }

    return result
  }
}
