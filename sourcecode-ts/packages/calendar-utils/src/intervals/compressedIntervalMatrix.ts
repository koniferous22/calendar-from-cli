export const createCompressedIntervalMatrix = (columns: number) => {
  let state = [] as boolean[][]
  const pushInterval = (from: number, to: number) => {
    if (from > to || from >= columns) {
      return {
        success: false as const,
      }
    }
    let foundIndex = state.findIndex((row) => row.slice(from, to + 1).every((isAvailable) => isAvailable))
    if (foundIndex >= 0) {
      state[foundIndex] = state[foundIndex].map((originalValue, index) =>
        index >= from && index <= to ? false : originalValue,
      )
    } else {
      foundIndex = state.length
      state.push(Array.from({ length: columns }).map((_, index) => (index >= from && index <= to ? false : true)))
    }
    return {
      success: true as const,
      pushedIndex: foundIndex,
    }
  }
  const getState = () => state
  return {
    pushInterval,
    getState,
  }
}
