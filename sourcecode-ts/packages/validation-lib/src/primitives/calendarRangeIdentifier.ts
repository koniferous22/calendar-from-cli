import { z } from 'zod'

export const zCalendarRangeIdentifierType = z.union([
  z.literal('dayLaneView'),
  z.literal('weekLaneView'),
  z.literal('monthCellView'),
])
