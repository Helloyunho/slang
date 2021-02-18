import { TokenType } from '../lexer.ts'
import { Base } from './base.ts'
import {
  ArrayParsed,
  BooleanParsed,
  DictElement,
  DictParsed,
  NullParsed,
  NumberParsed,
  ReturnsValue,
  StringParsed
} from './types.ts'

export class ValueParsers extends Base {
  stringParser() {
    const { value } = this.AST.checkToken({
      type: TokenType.String
    })

    const result: StringParsed = {
      type: 'StringParsed',
      value
    }

    return result
  }

  numberParser() {
    const value = Number(
      this.AST.checkToken({
        type: TokenType.Number
      }).value
    )

    const result: NumberParsed = {
      type: 'NumberParsed',
      value
    }

    return result
  }

  booleanParser() {
    const value =
      this.AST.checkToken({
        type: TokenType.Keyword,
        value: ['true', 'false']
      }).value === 'true'

    const result: BooleanParsed = {
      type: 'BooleanParsed',
      value
    }

    return result
  }

  nullParser() {
    this.AST.checkToken({
      type: TokenType.Type,
      value: 'null'
    })

    const result: NullParsed = {
      type: 'NullParsed'
    }

    return result
  }

  arrayParser(): ArrayParsed {
    this.AST.checkToken({
      type: TokenType.SqBraces,
      value: '['
    })

    const elements: ReturnsValue[] = []
    while (
      this.AST.checkToken({
        type: TokenType.SqBraces,
        value: ']',
        raiseError: false
      }) === undefined
    ) {
      elements.push(this.AST.getReturnsValue())
      this.AST.checkToken({
        type: TokenType.Operator,
        value: ',',
        raiseError: false
      })
    }

    const result: ArrayParsed = {
      type: 'ArrayParsed',
      elements
    }

    return result
  }

  dictParser(): DictParsed {
    this.AST.checkToken({
      type: TokenType.Braces,
      value: '{'
    })

    const elements: DictElement[] = []
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
      const elementValue = this.AST.getReturnsValue()

      const element: DictElement = {
        name: elementName,
        value: elementValue
      }

      elements.push(element)
      this.AST.checkToken({
        type: TokenType.Operator,
        value: ',',
        raiseError: false
      })
    }

    const result: DictParsed = {
      type: 'DictParsed',
      elements
    }

    return result
  }
}
