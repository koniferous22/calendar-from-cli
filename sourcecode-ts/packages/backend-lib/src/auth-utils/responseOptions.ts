import { primitives, types } from '@calendar-from-cli/validation-lib'
import { findAndValidateTrustedViewer } from './response.js'

export const resolveAuthResponseOptions = (
  authResponseOptions: types.AuthResponseOptions,
  trustedViewerRecord: Awaited<ReturnType<typeof findAndValidateTrustedViewer>>,
) => {
  let webAppSettings: types.WebAppSettings | undefined = undefined
  if (authResponseOptions.shouldIncludeViewerWebAppSettings) {
    const parsedWebAppSettings = primitives.zWebAppSettings.safeParse(trustedViewerRecord.WebAppSettings)
    if (parsedWebAppSettings.success) {
      webAppSettings = parsedWebAppSettings.data
    }
  }
  return {
    webAppSettings,
  }
}
