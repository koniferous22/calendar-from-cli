export const stripSecondsAndMilliseconds = (d: Date) => {
  const r = new Date(d)
  r.setSeconds(0, 0)
  return r
}
