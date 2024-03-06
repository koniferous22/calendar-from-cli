import { config, configurable } from '@calendar-from-cli/validation-lib'
import { z } from 'zod'

type UniversalConfig = z.infer<typeof config.zUniversalConfig>

export const createConfigurableUserInputValidators = (config: UniversalConfig) => ({
  zPasswordSetup: configurable.universalValidators.userInput.password.createZPasswordSetup(config),
})
