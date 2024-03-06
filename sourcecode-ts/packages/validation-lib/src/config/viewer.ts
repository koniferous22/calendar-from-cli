import { z } from 'zod'
import { zUniversalConfig } from './universal.js'

const zUiErrorMessage = z.string().min(20)

const zUiErrorHandling = z.object({
  routerErrorBoundary: z.object({
    errorText404: zUiErrorMessage,
    errorText403: zUiErrorMessage,
    errorFallback: zUiErrorMessage,
  }),
  renderingErrorBoundary: z.object({
    errorFallback: zUiErrorMessage,
  }),
})

export const zViewerConfig = z.intersection(
  zUniversalConfig,
  z.object({
    uiErrorHandling: zUiErrorHandling,
  }),
)

export type ViewerConfig = z.infer<typeof zViewerConfig>
