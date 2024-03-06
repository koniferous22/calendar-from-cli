import { config, configurable } from '@calendar-from-cli/validation-lib'
import { z } from 'zod'

type UniversalConfig = z.infer<typeof config.zUniversalConfig>

export const createConfigurableUrlInputValidators = (config: UniversalConfig) => ({
  zUrlCalendarRangeIdentifier: configurable.universalValidators.urlInput.createZUrlCalendarRangeIdentifier(
    config.inputValidation.api.calendarList.lowerLimit,
    config.inputValidation.api.calendarList.maxYearsAhead,
  ),
})
