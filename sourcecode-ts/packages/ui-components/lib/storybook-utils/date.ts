export const createDateWithDifferentTimeOfDay = (date: Date, hours: number, minutes: number) => {
  const x = new Date(date)
  x.setHours(hours)
  x.setMinutes(minutes)
  x.setSeconds(0)
  x.setMilliseconds(0)
  return x
}
