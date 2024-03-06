import { createAdminScopeConfigurables } from '@calendar-from-cli/common-config'
import { getConfig } from './config'

let configurables: null | ReturnType<typeof createAdminScopeConfigurables> = null

export const getConfigurables = () => {
  if (configurables === null) {
    configurables = createAdminScopeConfigurables(getConfig())
  }
  return configurables
}
