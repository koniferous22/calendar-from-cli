import { createViewerScopeConfigurables } from '@calendar-from-cli/common-config'
import { getConfig } from './config.js'

let configurables: null | ReturnType<typeof createViewerScopeConfigurables> = null

export const getConfigurables = () => {
  if (configurables === null) {
    configurables = createViewerScopeConfigurables(getConfig())
  }
  return configurables
}
