import { z } from 'zod'

export const zAuthResponseOptions = z.object({
  shouldIncludeViewerWebAppSettings: z.boolean(),
})
