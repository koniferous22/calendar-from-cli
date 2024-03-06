import { z } from 'zod'

export const zCalendarPermissionView = z.union([z.literal('public'), z.literal('protected')])
