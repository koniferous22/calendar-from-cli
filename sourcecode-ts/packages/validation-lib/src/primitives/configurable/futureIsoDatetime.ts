import { zISODatetime } from '../../utils/isoDatetime.js'

export const createZFutureISODatetime = (gracePeriodMillis: number) =>
  zISODatetime.refine(
    (date) => date.getTime() + gracePeriodMillis >= new Date().getTime(),
    (date) => ({ message: `${date.toISOString()} occurs in past (expected future)` }),
  )
