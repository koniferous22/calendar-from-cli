import { z } from 'zod'

export const zTheme = z.union([z.literal('kenji'), z.literal('yoghurt'), z.literal('lagoon')])
