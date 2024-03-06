import { config, utils } from '@calendar-from-cli/validation-lib'
import { z } from 'zod'
import { createConfigurableDenyLists } from './configurable/denyLists.js'
import { createConfigurableApiInputValidators } from './configurable/apiInputValidators.js'
import { transformRecursiveObject } from './utils/transformRecursiveObject.js'
import { createUniversalConfigurableApiAuthValidators } from './configurable/apiAuthValidators.js'
import { createConfigurableUserInputValidators } from './configurable/userInputValidators.js'
import { createConfigurableUrlInputValidators } from './configurable/urlInputValidators.js'

type AdminConfig = z.infer<typeof config.zAdminConfig>
type BackendConfig = z.infer<typeof config.zBackendConfig>
type ViewerConfig = z.infer<typeof config.zViewerConfig>

export const createBackendScopeConfigurables = (backendConfig: BackendConfig) => {
  const denyLists = createConfigurableDenyLists(backendConfig)
  const zDenyListValidators = transformRecursiveObject(denyLists, utils.zDenyList)
  return {
    validators: {
      apiInput: createConfigurableApiInputValidators(backendConfig),
      apiAuth: createUniversalConfigurableApiAuthValidators(backendConfig),
      userInput: createConfigurableUserInputValidators(backendConfig),
      forConstants: {
        denyLists: zDenyListValidators,
      },
    },
    constants: {
      denyLists,
    },
  }
}

export const createAdminScopeConfigurables = (adminConfig: AdminConfig) => {
  return {
    validators: {
      apiInput: createConfigurableApiInputValidators(adminConfig),
      userInput: createConfigurableUserInputValidators(adminConfig),
    },
  }
}

export const createViewerScopeConfigurables = (viewerConfig: ViewerConfig) => {
  return {
    validators: {
      apiInput: createConfigurableApiInputValidators(viewerConfig),
      apiAuth: createUniversalConfigurableApiAuthValidators(viewerConfig),
      userInput: createConfigurableUserInputValidators(viewerConfig),
      urlInput: createConfigurableUrlInputValidators(viewerConfig),
    },
  }
}
