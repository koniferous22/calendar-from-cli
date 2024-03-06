import { config, configurable } from '@calendar-from-cli/validation-lib'
import { z } from 'zod'

type UniversalConfig = z.infer<typeof config.zUniversalConfig>

export const createUniversalConfigurableApiAuthValidators = (universalConfig: UniversalConfig) => ({
  zAccessTokenPayload: configurable.universalValidators.authInput.createZAccessTokenPayload(universalConfig),
  zRefreshTokenPayload: configurable.universalValidators.authInput.createZRefreshTokenPayload(universalConfig),
})
