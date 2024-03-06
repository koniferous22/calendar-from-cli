import { describe, expect, test } from '@jest/globals'
import { createCompressedIntervalMatrix } from '../src/intervals/compressedIntervalMatrix'

type Operation = {
  input: {
    from: number
    to: number
  }
  result: {
    pushedIndex: number
  }
  stateAfter: boolean[][]
}

type SequenceTestInput = {
  columns: number
  operations: Operation[]
}

const sequenceTest = (testMsg: string, { columns, operations }: SequenceTestInput) => {
  test(testMsg, () => {
    const { pushInterval, getState } = createCompressedIntervalMatrix(columns)
    for (const operation of operations) {
      const result = pushInterval(operation.input.from, operation.input.to)
      expect(result.success).toBe(true)
      const pushedIndex = result.pushedIndex
      expect(pushedIndex).toEqual(operation.result.pushedIndex)
      expect(getState()).toEqual(operation.stateAfter)
    }
  })
}

describe('Compressed Interval Matrix tests', () => {
  sequenceTest('Example Compressed Interval Matrix', {
    columns: 7,
    operations: [
      {
        input: {
          from: 1,
          to: 5,
        },
        result: {
          pushedIndex: 0,
        },
        stateAfter: [[true, false, false, false, false, false, true]],
      },
      {
        input: {
          from: 0,
          to: 1,
        },
        result: {
          pushedIndex: 1,
        },
        stateAfter: [
          [true, false, false, false, false, false, true],
          [false, false, true, true, true, true, true],
        ],
      },
      {
        input: {
          from: 1,
          to: 5,
        },
        result: {
          pushedIndex: 2,
        },
        stateAfter: [
          [true, false, false, false, false, false, true],
          [false, false, true, true, true, true, true],
          [true, false, false, false, false, false, true],
        ],
      },
      {
        input: {
          from: 2,
          to: 4,
        },
        result: {
          pushedIndex: 1,
        },
        stateAfter: [
          [true, false, false, false, false, false, true],
          [false, false, false, false, false, true, true],
          [true, false, false, false, false, false, true],
        ],
      },
    ],
  })
})
