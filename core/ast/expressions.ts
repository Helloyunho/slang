import { TokenType } from '../lexer/mod.ts'
import { Base } from './base.ts'
import {
  AccessDotExpression,
  Identifier,
  AccessWithArrayLikeExpression,
  CallFunctionExpression,
  ReturnsValue,
  TypeChangeExpression
} from './types.ts'

export class Expressions extends Base {
  accessDotExpression(
    leftAST?:
      | Identifier
      | CallFunctionExpression
      | AccessWithArrayLikeExpression
  ) {
    const left =
      leftAST ??
      (this.accessExpression(true) as
        | Identifier
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
      right,
      start: left.start,
      end: right.end
    }

    return result
  }

  accessWithArrayLikeExpression(
    leftAST?: Identifier | CallFunctionExpression | AccessDotExpression
  ) {
    const left =
      leftAST ??
      (this.accessExpression(false, true) as
        | Identifier
        | CallFunctionExpression
        | AccessDotExpression)

    const { start } = this.AST.checkToken({
      type: TokenType.SqBraces,
      value: '['
    })
    const right = this.AST.getReturnsValue()
    const { end } = this.AST.checkToken({
      type: TokenType.SqBraces,
      value: ']'
    })

    const result: AccessWithArrayLikeExpression = {
      type: 'AccessWithArrayLikeExpression',
      left,
      right,
      start,
      end
    }

    return result
  }

  identifierExpression() {
    const { value: name, start, end } = this.AST.checkToken({
      type: TokenType.Word
    })

    const result: Identifier = {
      type: 'Identifier',
      name,
      start,
      end
    }

    return result
  }

  callFunctionExpression(
    leftAST?:
      | Identifier
      | CallFunctionExpression
      | AccessDotExpression
      | AccessWithArrayLikeExpression
  ) {
    const what =
      leftAST ??
      (this.accessExpression(false, false, true) as
        | Identifier
        | CallFunctionExpression
        | AccessDotExpression)

    const { start } = this.AST.checkToken({
      type: TokenType.Parenthesis,
      value: '('
    })

    const params: ReturnsValue[] = []
    let end
    while (
      (end = this.AST.checkToken({
        type: TokenType.Parenthesis,
        value: ')',
        raiseError: false
      })?.end) === undefined
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
      params,
      start,
      end
    }

    return result
  }

  accessExpression(
    skipDotExpression = false,
    skipArrayLikeExpression = false,
    skipFunctionExpression = false
  ):
    | AccessDotExpression
    | Identifier
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
      return this.identifierExpression()
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
      returnNull,
      start: value.start,
      end: toType.end
    }

    return result
  }
}
