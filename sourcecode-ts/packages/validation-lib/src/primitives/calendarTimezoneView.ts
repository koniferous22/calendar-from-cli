import { z } from 'zod'

export const zCalendarTimezoneView = z.union([z.literal('owner'), z.literal('client')])
