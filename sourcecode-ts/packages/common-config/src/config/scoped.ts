import { config } from '@calendar-from-cli/validation-lib'
import { z } from 'zod'
import path from 'path'
import _ from 'lodash'
import { loadConfigFromFS } from '../loaders/fs.js'
import { getUniversalConfig } from './universal.js'

type Scope = 'admin' | 'backend' | 'viewer'

type ScopedConfig =
  | {
      scope: 'admin'
      config: z.infer<typeof config.zAdminConfig>
    }
  | {
      scope: 'backend'
      config: z.infer<typeof config.zBackendConfig>
    }
  | {
      scope: 'viewer'
      config: z.infer<typeof config.zViewerConfig>
    }

let scopedConfig = null as null | ScopedConfig

export const getScopedConfig = <T extends Scope>(
  configDirectory: string,
  scope: T,
): Extract<ScopedConfig, { scope: T }>['config'] => {
  if (scopedConfig && scopedConfig.scope !== scope) {
    throw new Error(
      `Attempting to load "${scope}" scoped config while config is already initialized under different scope - ${scopedConfig.scope}`,
    )
  }
  if (scopedConfig === null) {
    const scopedConfigFp = path.join(configDirectory, `scoped/${scope}/${scope}.json`)
    const scopedExclusiveConfigObj = loadConfigFromFS(scopedConfigFp)
    const scopedConfigObj = _.merge(getUniversalConfig(configDirectory), scopedExclusiveConfigObj)
    scopedConfig = (function () {
      switch (scope) {
        case 'admin':
          return {
            scope,
            config: config.zAdminConfig.parse(scopedConfigObj),
          }
        case 'backend':
          return {
            scope,
            config: config.zBackendConfig.parse(scopedConfigObj),
          }
        case 'viewer':
          return {
            scope,
            config: config.zViewerConfig.parse(scopedConfigObj),
          }
        default:
          throw new Error(`Invalid config scope "${scope}"`)
      }
    })()
  }
  return scopedConfig.config as any
}
