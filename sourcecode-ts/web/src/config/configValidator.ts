import { z } from 'zod'
import { config, primitives } from '@calendar-from-cli/validation-lib'

const zRefreshTokenImplementation = z.union([z.literal('cookieHeader'), z.literal('authorizationHeader')])

const zAuth = z.object({
  modal: z.object({
    shouldDisallowClosing: z.boolean(),
  }),
  refreshTokenImplementation: zRefreshTokenImplementation,
})

const zCalendarRenderingOptions = z.object({
  cellView: z.object({
    minCalendarEventHeightPx: z.number().positive(),
    minimumDayCellCapacity: z.number().min(2),
  }),
  laneView: z.object({
    eventSizeResolution: primitives.zEventUiSizeResolution,
    itemBreakpointsInMinutes: z
      .object({
        minLengthForDisplayDuration: z.number().positive(),
        minLengthForDisplayTitle: z.number().positive(),
      })
      .refine((val) => val.minLengthForDisplayDuration > val.minLengthForDisplayTitle, {
        message: 'Breakpoint for duration display should be larger than breakpoint for title display',
      }),
  }),
})

const zHeader = z.object({
  viewSettingsBar: z.object({
    customOwnerTimezoneLabel: z.string().optional(),
    sameTimezoneText: z.string(),
  }),
  arrowKeyboardEventDebounce: z.number().positive(),
})

const zPageLoader = z.union([z.literal('overlay'), z.literal('headerIcon')])

export const zWebAppConfig = z.intersection(
  config.zViewerConfig,
  z.object({
    auth: zAuth,
    calendar: z.object({
      header: zHeader,
      renderingOptions: zCalendarRenderingOptions,
      syncCurrentTimeFrequencySeconds: z.number().positive(),
      calendarDataRefetchFrequencySeconds: z.number().positive(),
    }),
    iconHref: z.string(),
    pageLoader: zPageLoader,
    secretLinkHref: z.string().url(),
    title: z.string(),
    publicApi: z.string().url(),
  }),
)
