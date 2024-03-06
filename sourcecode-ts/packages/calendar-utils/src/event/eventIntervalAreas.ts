// Algorithm preassumptions
// * input consists of chronologically sorted intervals, ordered by interval begin
// * interval end is assumed to be later than interval begin

// Algorithm should return processed list of output intervals, where each output intervals contains references to all input intervals it contains

export type Callbacks<T, IntervalT> = {
  getIntervalBegin: (_: T) => IntervalT
  getIntervalEnd: (_: T) => IntervalT
  serializeIntervalType: (_: IntervalT) => number
  deserializeIntervalType: (_: number) => IntervalT
}

// Algorithm explanation
// 1. consume 1st item from queue (earliest interval) - push to 'overlappingItems'
// 2. consume from queue all items that overlap with current event - push all to 'overlappingItems'
// 3. if none overlapping intervals found - return the 1st element as area occupied by a single interval
// 4. otherwise
// 5. if 2nd interval starts exclusively later than 1st interval - split the 1st into two areas
//   * 1st exclusively occupied by 1st interval
//   * 2nd overlapping area of 2 interval
// 6. from all overlapping intervals (including 1st) find an interval that ends earliest - 'overlappingEarliestEnd'
// 7. push to result interval with following traits
//   * output interval end = 'overlappingEarliestEnd'
//   * it should contain data of all intervals from 'overlappingItems' that start earlier than 'overlappingEarliestEnd'
// 8. trim the remaining 'overlappingItems' so that they start with 'overlappingEarliestEnd'
// 9. prepend 'overlappingItems' contents back into queue
export const extractIntervalAreas = <T, IntervalT>(
  input: T[],
  { getIntervalBegin, getIntervalEnd, serializeIntervalType, deserializeIntervalType }: Callbacks<T, IntervalT>,
) => {
  type QueueItem = {
    begin: number
    end: number
    data: T
    isTrimmedAtBegin: boolean
  }
  type Result = {
    begin: IntervalT
    end: IntervalT
    data: [T, ...T[]]
    isTrimmedAtBegin: boolean
    isTrimmedAtEnd: boolean
  }
  let inputQueue: QueueItem[] = input.map((data) => ({
    data,
    begin: serializeIntervalType(getIntervalBegin(data)),
    end: serializeIntervalType(getIntervalEnd(data)),
    isTrimmedAtBegin: false,
  }))
  let overlappingItems: QueueItem[] = []
  let result: Result[] = [] // Invariant - at beginning of loop 'overlappingItems', is empty, and 'inputQueue' contains list of items, sorted chronologically according to 'getIntervalBegin'
  while (inputQueue.length > 0) {
    overlappingItems.push(inputQueue.shift()!)
    while (inputQueue.length > 0 && inputQueue[0].begin < overlappingItems[0].end) {
      overlappingItems.push(inputQueue.shift()!)
    }
    if (overlappingItems.length === 1) {
      result.push({
        begin: deserializeIntervalType(overlappingItems[0].begin),
        end: deserializeIntervalType(overlappingItems[0].end),
        data: [overlappingItems[0].data],
        isTrimmedAtBegin: overlappingItems[0].isTrimmedAtBegin,
        isTrimmedAtEnd: false,
      })
      overlappingItems.shift()
      inputQueue = overlappingItems.concat(inputQueue)
      overlappingItems = []
      continue
    }
    // Intersection present
    let intersectionTrimmedAtBegin = false
    // Checking if intervals don't begin at the exact same time
    // Period between begin of first item and begin of 2nd item is uniquely occupied by the 1st item
    if (overlappingItems[0].begin < overlappingItems[1].begin) {
      intersectionTrimmedAtBegin = true
      result.push({
        begin: deserializeIntervalType(overlappingItems[0].begin),
        end: deserializeIntervalType(overlappingItems[1].begin),
        data: [overlappingItems[0].data],
        isTrimmedAtBegin: overlappingItems[0].isTrimmedAtBegin,
        isTrimmedAtEnd: true,
      })
      overlappingItems = overlappingItems.map((item, index) =>
        index === 0
          ? {
              ...item,
              // Original interval split to two distinct intervals
              // 1st one represents area uniquely occupied by 1 interval
              // 2nd one enqueued back by .map call, as the area will be occupied by two intervals
              begin: overlappingItems[1].begin,
              isTrimmedAtBegin: true,
            }
          : item,
      )
    }
    // From this point there are at least 2 intervals starting at exact same point in time (trimmed in the step above)
    let overlappingEarliestEnd = overlappingItems[0].end
    for (const overlappingItem of overlappingItems) {
      if (overlappingItem.end < overlappingEarliestEnd) {
        overlappingEarliestEnd = overlappingItem.end
      }
    }
    // Trim overlappingItems through .map + filter out empty intervals
    const trimmedOverlappingItems = overlappingItems
      .map((item) =>
        item.begin < overlappingEarliestEnd
          ? {
              ...item,
              begin: overlappingEarliestEnd,
              isTrimmedAtBegin: true,
            }
          : item,
      )
      .filter(({ begin, end }) => begin < end)
    // Add to result all items  earlier than earliest end
    result.push({
      begin: deserializeIntervalType(overlappingItems[0].begin),
      end: deserializeIntervalType(overlappingEarliestEnd),
      data: overlappingItems.filter(({ begin }) => begin < overlappingEarliestEnd).map(({ data }) => data) as any,
      isTrimmedAtBegin: intersectionTrimmedAtBegin || overlappingItems[0].isTrimmedAtBegin,
      isTrimmedAtEnd: trimmedOverlappingItems.length !== 0,
    })
    // Maintain invariant
    overlappingItems = trimmedOverlappingItems
    inputQueue = overlappingItems.concat(inputQueue)
    overlappingItems = []
  }
  return result
}
