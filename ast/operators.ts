import { TokenType } from '../lexer.ts'
import { Base } from './base.ts'
import {
  ArithmeticOperator,
  BinaryOperator,
  LogicalOperator,
  ReturnsValue,
  UnaryOperator
} from './types.ts'

export class Operators extends Base {
  arithmeticOperator(leftAST?: ReturnsValue) {
    const left = leftAST ?? this.AST.getReturnsValue()
    const operator = this.AST.checkToken({
      type: TokenType.ArithmeticOperator
    }).value as '+' | '-' | '*' | '/' | '%'
    const right = this.AST.getReturnsValue(true, [
      'ArithmeticOperator',
      'LogicalOperator',
      'BinaryOperator'
    ])

    const result: ArithmeticOperator = {
      type: 'ArithmeticOperator',
      left,
      operator,
      right
    }

    return result
  }

  logicalOperator(leftAST?: ReturnsValue) {
    const left = leftAST ?? this.AST.getReturnsValue()
    const operator = this.AST.checkToken({
      type: TokenType.LogicalOperator
    }).value as '==' | '!=' | '&&' | '||' | '<' | '<=' | '>' | '>='
    const right = this.AST.getReturnsValue(true, [
      'ArithmeticOperator',
      'LogicalOperator',
      'BinaryOperator'
    ])

    const result: LogicalOperator = {
      type: 'LogicalOperator',
      left,
      operator,
      right
    }

    return result
  }

  binaryOperator(leftAST?: ReturnsValue) {
    const left = leftAST ?? this.AST.getReturnsValue()
    const operator = this.AST.checkToken({
      type: TokenType.BinaryOperator
    }).value as '^' | '&' | '|'
    const right = this.AST.getReturnsValue(true, [
      'ArithmeticOperator',
      'LogicalOperator',
      'BinaryOperator'
    ])

    const result: BinaryOperator = {
      type: 'BinaryOperator',
      left,
      operator,
      right
    }

    return result
  }

  unaryOperator(leftAST?: ReturnsValue) {
    let location: 'left' | 'right'
    let operator
    let value
    if (
      leftAST === undefined &&
      this.AST.checkToken({
        type: TokenType.UnaryOperator,
        raiseError: false,
        addToIndex: false
      }) !== undefined
    ) {
      location = 'left'
      operator = this.AST.checkToken({
        type: TokenType.UnaryOperator
      }).value as '++' | '--' | '!' | '+' | '-'
      value = this.AST.getReturnsValue(true, ['UnaryOperator'])
    } else {
      location = 'right'
      value = leftAST ?? this.AST.getReturnsValue(true, ['UnaryOperator'])
      operator = this.AST.checkToken({
        type: TokenType.UnaryOperator,
        value: ['++', '--']
      }).value as '++' | '--'
    }

    const result: UnaryOperator = {
      type: 'UnaryOperator',
      value,
      operator,
      location
    }

    return result
  }
}
