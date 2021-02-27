import { Position, TokenType } from '../lexer/mod.ts'
import { Base } from './base.ts'
import {
  ArrayParsed,
  BooleanParsed,
  DictElement,
  DictParsed,
  NullParsed,
  NumberParsed,
  ReturnsValue,
  StringParsed,
} from './types.ts'

export class ValueParsers extends Base {
  stringParser() {
    const { value, start, end } = this.AST.checkToken({
      type: TokenType.String,
    })

    const result: StringParsed = {
      type: 'StringParsed',
      value,
      start,
      end,
    }

    return result
  }

  numberParser() {
    const token = this.AST.checkToken({
      type: TokenType.Number,
    })

    const value = Number(token.value)
    const { start, end } = token

    const result: NumberParsed = {
      type: 'NumberParsed',
      value,
      start,
      end,
    }

    return result
  }

  booleanParser() {
    const token = this.AST.checkToken({
      type: TokenType.Keyword,
      value: ['true', 'false'],
    })

    const value = token.value === 'true'
    const { start, end } = token

    const result: BooleanParsed = {
      type: 'BooleanParsed',
      value,
      start,
      end,
    }

    return result
  }

  nullParser() {
    const { start, end } = this.AST.checkToken({
      type: TokenType.Type,
      value: 'null',
    })

    const result: NullParsed = {
      type: 'NullParsed',
      start,
      end,
    }

    return result
  }

  arrayParser(): ArrayParsed {
    const { start } = this.AST.checkToken({
      type: TokenType.SqBraces,
      value: '[',
    })

    const elements: ReturnsValue[] = []
    let endToken
    while (
      (endToken = this.AST.checkToken({
        type: TokenType.SqBraces,
        value: ']',
        raiseError: false,
      })) === undefined
    ) {
      elements.push(this.AST.getReturnsValue())
      this.AST.checkToken({
        type: TokenType.Operator,
        value: ',',
        raiseError: false,
      })
    }

    const result: ArrayParsed = {
      type: 'ArrayParsed',
      elements,
      start,
      end: endToken.end,
    }

    return result
  }

  dictParser(): DictParsed {
    const { start } = this.AST.checkToken({
      type: TokenType.Braces,
      value: '{',
    })

    const elements: DictElement[] = []
    let endToken
    while (
      (endToken = this.AST.checkToken({
        type: TokenType.Braces,
        value: '}',
        raiseError: false,
      })) === undefined
    ) {
      const elementName = this.AST.expressions.identifierExpression()

      this.AST.checkToken({
        type: TokenType.Operator,
        value: ':',
      })
      const elementValue = this.AST.getReturnsValue()

      const element: DictElement = {
        name: elementName,
        value: elementValue,
        start: elementName.start,
        end: elementValue.end,
      }

      elements.push(element)
      this.AST.checkToken({
        type: TokenType.Operator,
        value: ',',
        raiseError: false,
      })
    }

    const result: DictParsed = {
      type: 'DictParsed',
      elements,
      start,
      end: endToken.end,
    }

    return result
  }
}
