import { z } from 'zod'
import { zTheme } from './theme.js'
import { zCalendarRangeIdentifierType } from './calendarRangeIdentifier.js'

export const zWebAppSettings = z.object({
  theme: zTheme,
  secretLinkText: z.string(),
  homeRedirect: zCalendarRangeIdentifierType,
  smHomeRedirect: zCalendarRangeIdentifierType,
})
