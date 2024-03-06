export const getUTCBeginningOfCurrentDay = (d: Date) => {
  const result = new Date(d)
  result.setUTCHours(0, 0, 0, 0)
  return result
}

export const getUTCBeginningOfNextDay = (d: Date) => {
  const result = new Date(d)
  result.setDate(d.getDate() + 1)
  result.setUTCHours(0, 0, 0, 0)
  return result
}

export const getUTCBeginningOfCurrentWeek = (d: Date) => {
  const result = new Date(d)
  result.setUTCDate(d.getUTCDate() - d.getUTCDay())
  result.setUTCHours(0, 0, 0, 0)
  return result
}

export const getUTCBeginningOfNextWeek = (d: Date) => {
  const daysUntilNextWeek = 7 - d.getUTCDay()
  const result = new Date(d)
  result.setUTCDate(d.getUTCDate() + daysUntilNextWeek)
  result.setUTCHours(0, 0, 0, 0)
  return result
}

export const getUTCBeginningOfCurrentMonth = (d: Date) => {
  const result = new Date(d)
  result.setUTCDate(1)
  result.setUTCHours(0, 0, 0, 0)
  return result
}

export const getUTCBeginningOfNextMonth = (d: Date) => {
  const result = new Date(d)
  result.setUTCMonth(d.getUTCMonth() + 1, 1)
  result.setUTCHours(0, 0, 0, 0)
  return result
}

export const getUTCBeginningOfCurrentYear = (d: Date) => {
  const result = new Date(d)
  result.setUTCFullYear(d.getUTCFullYear(), 0, 1)
  result.setUTCHours(0, 0, 0, 0)
  return result
}

export const createUTCDate = (year: number, month: number, dayOfMonth: number, hour: number, minute: number) => {
  const result = new Date()
  result.setUTCFullYear(year, month, dayOfMonth)
  result.setUTCHours(hour, minute)
  return result
}
