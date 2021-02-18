export enum TokenType {
  Word,
  Keyword,
  Type,
  Number,
  Float,
  String,
  Char,
  AssignmentOperator,
  ArithmeticOperator,
  LogicalOperator,
  BinaryOperator,
  UnaryOperator,
  Parenthesis,
  Braces,
  SqBraces,
  Comment,
  CommentMultiline,
  Operator,
  NewLine
}

export interface Position {
  line: number
  col: number
}

export interface Token extends Position {
  type: TokenType
  value: string
}

export interface LexerOperators {
  assignment: string[]
  arithmetic: string[]
  unary: string[]
  logical: string[]
  binary: string[]
  comment: string[]
  longComment: string[]
  other: string[]
}

export interface LexerOptions {
  keywords: string[]
  types: string[]
  operators: LexerOperators
}

export class LexerError implements Position {
  msg: string = ''
  line: number = 0
  col: number = 0

  constructor(lexer: Lexer, msg: string) {
    this.line = lexer.line
    this.col = lexer.col
    this.msg = msg
  }
}

export enum StateType {
  None,
  Word,
  Number,
  Float,
  String,
  Parenthesis,
  Braces,
  SqBraces,
  Char,
  Operator,
  UnaryOperator,
  Comment,
  CommentMultiline,
  NewLine
}

export class LexerState implements Position {
  lexer: Lexer
  type: StateType = StateType.None
  value: string = ''
  line: number = 0
  col: number = 0

  constructor(lexer: Lexer) {
    this.lexer = lexer
  }

  reset() {
    this.type = StateType.None
    this.value = ''
    this.line = 0
    this.col = 0
  }

  push(ch: string) {
    this.value += ch
  }

  pos() {
    this.line = this.lexer.line
    this.col = this.lexer.col
  }

  start(type: StateType) {
    this.type = type
    this.pos()
    this.value = ''
  }

  token(type: TokenType): Token {
    const token = { type, value: this.value, line: this.line, col: this.col }
    this.lexer.results.push(token)
    return token
  }

  end() {
    if (this.type === StateType.Number) {
      this.token(TokenType.Number)
    } else if (this.type === StateType.Float) {
      this.token(TokenType.Float)
    } else if (this.type === StateType.Word) {
      if (this.lexer.options.keywords.includes(this.value))
        this.token(TokenType.Keyword)
      else if (this.lexer.options.types.includes(this.value))
        this.token(TokenType.Type)
      else this.token(TokenType.Word)
    } else if (this.type === StateType.String) {
      this.token(TokenType.String)
    } else if (this.type === StateType.Char) {
      if (this.value.length !== 1)
        this.lexer.results.error('Expected char to be only one character')
      this.token(TokenType.Char)
    } else if (this.type === StateType.Operator) {
      let op = this.lexer.getOp(this.value)
      if (op === 'arithmetic') {
        this.token(TokenType.ArithmeticOperator)
      } else if (op === 'assignment') {
        this.token(TokenType.AssignmentOperator)
      } else if (op === 'logical') {
        this.token(TokenType.LogicalOperator)
      } else if (op === 'binary') {
        this.token(TokenType.BinaryOperator)
      } else if (op === 'unary') {
        this.token(TokenType.UnaryOperator)
      } else {
        this.token(TokenType.Operator)
      }
    } else if (this.type === StateType.Comment) {
      this.token(TokenType.Comment)
    } else if (this.type === StateType.CommentMultiline) {
      this.token(TokenType.CommentMultiline)
    } else if (this.type === StateType.UnaryOperator) {
      this.token(TokenType.UnaryOperator)
    } else if (this.type === StateType.NewLine) {
      this.token(TokenType.NewLine)
    }
    this.reset()
  }
}

export interface ILexerResults {
  tokens: Token[]
  errors: LexerError[]
}

export class LexerResults implements ILexerResults {
  lexer: Lexer
  tokens: Token[] = []
  errors: LexerError[] = []

  constructor(lexer: Lexer) {
    this.lexer = lexer
  }

  reset() {
    this.tokens = []
    this.errors = []
  }

  push(token: Token) {
    this.tokens.push(token)
  }

  error(err: string) {
    this.errors.push(new LexerError(this.lexer, err))
  }

  output() {
    const res: ILexerResults = {
      tokens: this.tokens,
      errors: this.errors
    }
    this.reset()
    return res
  }
}

export class Lexer implements Position {
  state: LexerState
  options: LexerOptions
  results: LexerResults
  line: number = 0
  col: number = 0

  constructor(options: LexerOptions) {
    this.options = options
    this.results = new LexerResults(this)
    this.state = new LexerState(this)
  }

  reset() {
    this.state.reset()
    this.results.reset()
    this.line = 0
    this.col = 0
  }

  newline() {
    this.col = 1
    this.line += 1
  }

  move() {
    this.col += 1
  }

  start() {
    this.reset()
    this.newline()
  }

  end() {
    const res = this.results.output()
    this.reset()
    return res
  }

  checkIfItsOperator(char: string): boolean {
    const operatorsMerged: string[] = [].concat(
      ...Object.values(this.options.operators)
    )

    return operatorsMerged.includes(char)
  }

  parse(code: string): ILexerResults {
    this.start()
    const chars = code.split('')

    let idx = 0
    while (idx < chars.length) {
      const char = chars[idx]
      const cc = char.charCodeAt(0)
      const state = () => this.state.type

      if (state() === StateType.String && char !== '"') {
        if (char === '\n') {
          this.newline()
          this.results.error('Expected end of string')
          break
        }
        this.state.push(char)
      } else if (state() === StateType.Comment) {
        if (char === '\n') {
          this.newline()
          this.state.end()
        } else this.state.push(char)
      } else if (state() == StateType.CommentMultiline) {
        if (char === '*' && chars[idx + 1] === '/') {
          idx++
          this.move()
          this.state.end()
        } else this.state.push(char)
      } else {
        if (
          (cc >= 'a'.charCodeAt(0) && cc <= 'z'.charCodeAt(0)) ||
          (cc >= 'A'.charCodeAt(0) && cc <= 'Z'.charCodeAt(0)) ||
          char === '_' ||
          char === '$'
        ) {
          if (state() === StateType.None) {
            this.state.start(StateType.Word)
            this.state.push(char)
          } else if (state() === StateType.Word) {
            this.state.push(char)
          } else {
            this.results.error(`Unexpected token ${char}`)
            break
          }
        } else if (char === ' ') {
          this.state.end()
        } else if (char === '\n') {
          if (state() === StateType.Char) {
            this.results.error('Unexpected new line in Char state')
          }
          this.state.end()
          this.state.start(StateType.NewLine)
          this.state.pos()
          this.state.end()
          this.newline()
        } else if (char === '\r') {
        } else if (cc >= '0'.charCodeAt(0) && cc <= '9'.charCodeAt(0)) {
          if (state() === StateType.None) {
            this.state.start(StateType.Number)
            this.state.push(char)
          } else if (
            state() === StateType.Number ||
            state() === StateType.Float ||
            state() === StateType.Word
          ) {
            this.state.push(char)
          } else {
            this.results.error(`Unexpected token ${char}`)
            break
          }
        } else if (char === '"') {
          if (state() === StateType.None) {
            this.state.start(StateType.String)
          } else if (state() === StateType.String) {
            this.state.end()
          } else {
            this.results.error('Unexpected token "')
            break
          }
        } else if (char === "'") {
          if (state() === StateType.None) {
            this.state.start(StateType.Char)
          } else if (state() === StateType.Char) {
            this.state.end()
          } else {
            this.results.error("Unexpected token '")
            break
          }
        } else if (char === '.') {
          if (state() === StateType.Number || state() === StateType.Float) {
            this.state.type = StateType.Float
            this.state.push(char)
          } else {
            this.state.end()
            this.state.start(StateType.Operator)
            this.state.pos()
            this.state.push(char)
            this.state.end()
          }
        } else if (char === ')' || char === '(') {
          this.state.end()
          this.state.push(char)
          this.state.pos()
          this.state.token(TokenType.Parenthesis)
          this.state.reset()
        } else if (char === '{' || char === '}') {
          this.state.end()
          this.state.push(char)
          this.state.pos()
          this.state.token(TokenType.Braces)
          this.state.reset()
        } else if (char === '[' || char === ']') {
          this.state.end()
          this.state.push(char)
          this.state.pos()
          this.state.token(TokenType.SqBraces)
          this.state.reset()
        } else {
          this.state.end()

          let opChars = ''
          while (
            chars[idx] &&
            chars[idx] !== ' ' &&
            opChars.length < 2 &&
            this.checkIfItsOperator(chars[idx])
          ) {
            opChars += chars[idx]
            this.move()
            idx++
          }
          idx--

          if (opChars === '+' || opChars === '-') {
            if (
              [
                TokenType.ArithmeticOperator,
                TokenType.AssignmentOperator,
                TokenType.BinaryOperator,
                TokenType.LogicalOperator,
                TokenType.UnaryOperator,
                TokenType.Operator,
                undefined
              ].includes(
                this.state.lexer.results.tokens[
                  this.state.lexer.results.tokens.length - 1
                ].type
              )
            ) {
              this.state.start(StateType.UnaryOperator)
            } else {
              this.state.start(StateType.Operator)
            }
            this.state.pos()
            this.state.push(opChars)
            this.state.end()
          } else {
            const op = this.getOp(opChars)

            if (op !== null) {
              this.state.start(StateType.Operator)
              this.state.pos()
              if (op === 'arithmetic') {
                this.state.push(opChars)
                this.state.end()
              } else if (op === 'assignment') {
                this.state.push(opChars)
                this.state.end()
              } else if (op === 'binary') {
                this.state.push(opChars)
                this.state.end()
              } else if (op === 'logical') {
                this.state.push(opChars)
                this.state.end()
              } else if (op === 'comment') {
                this.state.start(StateType.Comment)
                this.state.pos()
              } else if (op === 'commentMultiline') {
                this.state.start(StateType.CommentMultiline)
                this.state.pos()
              } else if (op === 'unary') {
                this.state.push(opChars)
                this.state.end()
              } else if (op === 'other') {
                this.state.push(opChars)
                this.state.end()
              } else {
                this.state.reset()
              }
            } else {
              this.results.error(`Unexpected token ${char}`)
              break
            }
          }
        }
      }

      this.move()
      idx++
    }

    if (
      this.state.type === StateType.String ||
      this.state.type === StateType.Char
    ) {
      this.results.error('Expected end of string/char, but got end of file')
    }
    this.state.end()

    return this.end()
  }

  getOp(char: string) {
    return this.options.operators.arithmetic.includes(char)
      ? 'arithmetic'
      : this.options.operators.assignment.includes(char)
      ? 'assignment'
      : this.options.operators.binary.includes(char)
      ? 'binary'
      : this.options.operators.logical.includes(char)
      ? 'logical'
      : this.options.operators.comment.includes(char)
      ? 'comment'
      : this.options.operators.longComment.includes(char)
      ? 'commentMultiline'
      : this.options.operators.unary.includes(char)
      ? 'unary'
      : this.options.operators.other.includes(char)
      ? 'other'
      : null
  }
}
