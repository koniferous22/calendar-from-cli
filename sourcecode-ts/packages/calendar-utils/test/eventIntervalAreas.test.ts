import { describe, expect, test } from '@jest/globals'

import { Callbacks, extractIntervalAreas } from '../src/event/eventIntervalAreas'

type TestInput = {
  id: number
  interval: [number, number]
}[]

const exampleInput1: TestInput = [
  { id: 1, interval: [1, 2] },
  { id: 2, interval: [2, 4] },
  { id: 3, interval: [2, 5] },
  { id: 4, interval: [2, 7] },
  { id: 5, interval: [6, 8] },
]

const exampleInput2: TestInput = [
  { id: 1, interval: [1, 4] },
  { id: 2, interval: [2, 5] },
  { id: 3, interval: [2, 7] },
  { id: 4, interval: [6, 8] },
]

const exampleInput3: TestInput = [
  { id: 1, interval: [1, 7] },
  { id: 2, interval: [2, 5] },
  { id: 3, interval: [2, 6] },
]

const cbs: Callbacks<TestInput[number], number> = {
  getIntervalBegin: ({ interval }) => interval[0],
  getIntervalEnd: ({ interval }) => interval[1],
  serializeIntervalType: (interval) => interval,
  deserializeIntervalType: (interval) => interval,
}

const eventIntervalAreaTest = (
  testMsg: string,
  input: TestInput,
  expectedOutput: ReturnType<typeof extractIntervalAreas>,
) => {
  test(testMsg, () => {
    expect(extractIntervalAreas(input, cbs)).toEqual(expectedOutput)
  })
}

type TestOutput = ReturnType<typeof extractIntervalAreas>

const expectedOutput1: TestOutput = [
  {
    begin: 1,
    end: 2,
    data: [
      {
        id: 1,
        interval: [1, 2],
      },
    ],
    isTrimmedAtBegin: false,
    isTrimmedAtEnd: false,
  },
  {
    begin: 2,
    end: 4,
    data: [
      {
        id: 2,
        interval: [2, 4],
      },
      {
        id: 3,
        interval: [2, 5],
      },
      {
        id: 4,
        interval: [2, 7],
      },
    ],
    isTrimmedAtBegin: false,
    isTrimmedAtEnd: true,
  },
  {
    begin: 4,
    end: 5,
    data: [
      {
        id: 3,
        interval: [2, 5],
      },
      {
        id: 4,
        interval: [2, 7],
      },
    ],
    isTrimmedAtBegin: true,
    isTrimmedAtEnd: true,
  },
  {
    begin: 5,
    end: 6,
    data: [
      {
        id: 4,
        interval: [2, 7],
      },
    ],
    isTrimmedAtBegin: true,
    isTrimmedAtEnd: true,
  },
  {
    begin: 6,
    end: 7,
    data: [
      {
        id: 4,
        interval: [2, 7],
      },
      {
        id: 5,
        interval: [6, 8],
      },
    ],
    isTrimmedAtBegin: true,
    isTrimmedAtEnd: true,
  },
  {
    begin: 7,
    end: 8,
    data: [
      {
        id: 5,
        interval: [6, 8],
      },
    ],
    isTrimmedAtBegin: true,
    isTrimmedAtEnd: false,
  },
]

const expectedOutput2: TestOutput = [
  {
    begin: 1,
    end: 2,
    data: [
      {
        id: 1,
        interval: [1, 4],
      },
    ],
    isTrimmedAtBegin: false,
    isTrimmedAtEnd: true,
  },
  {
    begin: 2,
    end: 4,
    data: [
      {
        id: 1,
        interval: [1, 4],
      },
      {
        id: 2,
        interval: [2, 5],
      },
      {
        id: 3,
        interval: [2, 7],
      },
    ],
    isTrimmedAtBegin: true,
    isTrimmedAtEnd: true,
  },
  {
    begin: 4,
    end: 5,
    data: [
      {
        id: 2,
        interval: [2, 5],
      },
      {
        id: 3,
        interval: [2, 7],
      },
    ],
    isTrimmedAtBegin: true,
    isTrimmedAtEnd: true,
  },
  {
    begin: 5,
    end: 6,
    data: [
      {
        id: 3,
        interval: [2, 7],
      },
    ],
    isTrimmedAtBegin: true,
    isTrimmedAtEnd: true,
  },
  {
    begin: 6,
    end: 7,
    data: [
      {
        id: 3,
        interval: [2, 7],
      },
      {
        id: 4,
        interval: [6, 8],
      },
    ],
    isTrimmedAtBegin: true,
    isTrimmedAtEnd: true,
  },
  {
    begin: 7,
    end: 8,
    data: [
      {
        id: 4,
        interval: [6, 8],
      },
    ],
    isTrimmedAtBegin: true,
    isTrimmedAtEnd: false,
  },
]

const expectedOutput3: TestOutput = [
  {
    begin: 1,
    end: 2,
    data: [
      {
        id: 1,
        interval: [1, 7],
      },
    ],
    isTrimmedAtBegin: false,
    isTrimmedAtEnd: true,
  },
  {
    begin: 2,
    end: 5,
    data: [
      {
        id: 1,
        interval: [1, 7],
      },
      {
        id: 2,
        interval: [2, 5],
      },
      {
        id: 3,
        interval: [2, 6],
      },
    ],
    isTrimmedAtBegin: true,
    isTrimmedAtEnd: true,
  },
  {
    begin: 5,
    end: 6,
    data: [
      {
        id: 1,
        interval: [1, 7],
      },
      {
        id: 3,
        interval: [2, 6],
      },
    ],
    isTrimmedAtBegin: true,
    isTrimmedAtEnd: true,
  },
  {
    begin: 6,
    end: 7,
    data: [
      {
        id: 1,
        interval: [1, 7],
      },
    ],
    isTrimmedAtBegin: true,
    isTrimmedAtEnd: false,
  },
]

const testData = [
  {
    message: 'Test Data 1',
    input: exampleInput1,
    output: expectedOutput1,
  },
  {
    message: 'Test Data 2',
    input: exampleInput2,
    output: expectedOutput2,
  },
  {
    message: 'Test Data 3',
    input: exampleInput3,
    output: expectedOutput3,
  },
]

describe('Event Interval Areas test', () => {
  testData.forEach(({ message, input, output }) => eventIntervalAreaTest(message, input, output))
})
