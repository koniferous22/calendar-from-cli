import { z } from 'zod'

export const zEventUiSizeResolution = z.union([z.literal('duration'), z.literal('intervalRange')])
