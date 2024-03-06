import { createBackendScopeConfigurables } from '@calendar-from-cli/common-config'
import { getConfig } from './config.js'

let configurables: null | ReturnType<typeof createBackendScopeConfigurables> = null

export const getConfigurables = () => {
  if (configurables === null) {
    configurables = createBackendScopeConfigurables(getConfig())
  }
  return configurables
}
