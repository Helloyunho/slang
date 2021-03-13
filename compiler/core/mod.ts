import { ReturnsValue, Types, TypeValues } from '../../core/ast/types.ts'
import { State } from './state.ts'

export class TypeChecker {
  state: State = new State()

  convertValueToType(
    value: TypeValues | ReturnsValue | Types
  ): Omit<Types, 'start' | 'end'> | undefined {
    if (typeof value !== 'string') {
      switch (value.type) {
        case 'StringParsed': {
          return {
            type: 'Types',
            value: [value]
          }
        }
        default: {
          return undefined
        }
      }
    } else {
      switch (value) {
        default: {
          return undefined
        }
      }
    }
  }
}
